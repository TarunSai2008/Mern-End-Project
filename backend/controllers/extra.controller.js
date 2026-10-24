const { z } = require('zod');
const Recipe = require('../models/Recipe.model');
const PantryItem = require('../models/PantryItem.model');
const GroceryItem = require('../models/GroceryItem.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { normName, compatible, toBase } = require('../utils/units');

// Weekly meal planner: pick recipes for 7 days → one aggregated shopping list
// (merged by ingredient in base units) minus what the pantry already covers.
exports.plan = asyncHandler(async (req, res) => {
  const parsed = z.object({ recipeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).max(14) })
    .safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);

  const recipes = await Recipe.find({ _id: { $in: parsed.data.recipeIds } });
  if (recipes.length !== parsed.data.recipeIds.length) throw new AppError(404, 'One or more recipes not found');

  const pantry = await PantryItem.find({ user: req.user.id });
  const pantryMap = new Map(pantry.map((p) => [normName(p.name), p]));

  // aggregate requirement per ingredient across all chosen recipes
  const needed = new Map(); // normName -> { name, unit(base), qty, recipes:[titles] }
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      const key = normName(ing.name);
      const base = toBase(ing.quantity, ing.unit);
      const entry = needed.get(key) || { name: normName(ing.name), unit: base.unit, qty: 0, recipes: [] };
      if (compatible(entry.unit, base.unit)) {
        entry.qty = Math.round((entry.qty + base.quantity) * 100) / 100;
      } else {
        // incompatible units (e.g. tsp vs g): track separately by suffixing
        const altKey = `${key}::${base.unit}`;
        const alt = needed.get(altKey) || { name: normName(ing.name), unit: base.unit, qty: 0, recipes: [] };
        alt.qty = Math.round((alt.qty + base.quantity) * 100) / 100;
        if (!alt.recipes.includes(r.title)) alt.recipes.push(r.title);
        needed.set(altKey, alt);
        continue;
      }
      if (!entry.recipes.includes(r.title)) entry.recipes.push(r.title);
      needed.set(key, entry);
    }
  }

  const shopping = [];
  for (const entry of needed.values()) {
    const owned = pantryMap.get(entry.name);
    let haveQty = 0;
    if (owned && compatible(owned.unit, entry.unit)) {
      haveQty = toBase(owned.quantity, owned.unit).quantity;
    }
    const missing = Math.round((entry.qty - haveQty) * 100) / 100;
    if (missing > 0) shopping.push({ name: entry.name, quantity: missing, unit: entry.unit, recipes: entry.recipes });
  }
  res.json({
    recipes: recipes.map((r) => ({ _id: r._id, title: r.title })),
    shoppingList: shopping,
    coveredFromPantry: needed.size - shopping.length,
  });
});

// One tap: push the plan's shopping list into the grocery list (merged).
exports.pushPlan = asyncHandler(async (req, res) => {
  const parsed = z.object({ items: z.array(z.object({
    name: z.string().trim().min(1).max(80),
    quantity: z.coerce.number().min(0),
    unit: z.string().trim().min(1).max(20),
  })).max(200) }).safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);

  const existing = new Set((await GroceryItem.find({ user: req.user.id, done: false })).map((g) => normName(g.name)));
  const toAdd = [];
  let skipped = 0;
  for (const item of parsed.data.items) {
    const key = normName(item.name);
    if (existing.has(key)) { skipped += 1; continue; }
    existing.add(key);
    toAdd.push({ user: req.user.id, name: key, quantity: item.quantity, unit: item.unit, aisle: 'other' });
  }
  if (toAdd.length) await GroceryItem.insertMany(toAdd);
  res.status(201).json({ added: toAdd.length, skipped });
});
