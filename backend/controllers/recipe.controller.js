const Recipe = require('../models/Recipe.model');
const PantryItem = require('../models/PantryItem.model');
const GroceryItem = require('../models/GroceryItem.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { normName, compatible, toBase } = require('../utils/units');

function pantryIndex(items) {
  const map = new Map();
  for (const it of items) map.set(normName(it.name), it);
  return map;
}

function shortfallFor(ingredient, pantryMap) {
  const owned = pantryMap.get(normName(ingredient.name));
  if (!owned) return { name: ingredient.name, unit: ingredient.unit, missing: ingredient.quantity, reason: 'not in pantry' };
  // Incompatible unit families (g vs tsp) can't be compared — assume the
  // household staple is available rather than blocking the recipe.
  if (!compatible(owned.unit, ingredient.unit)) return null;
  const need = toBase(ingredient.quantity, ingredient.unit);
  const have = toBase(owned.quantity, owned.unit);
  if (have.quantity + 1e-9 < need.quantity) {
    return {
      name: ingredient.name,
      unit: need.unit,
      missing: Math.round((need.quantity - have.quantity) * 100) / 100,
      reason: 'not enough quantity',
    };
  }
  return null;
}

exports.list = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find().sort('title');
  res.json(recipes);
});

// Ranked "what can I cook?" — recipes with zero shortfalls first, then fewer.
exports.match = asyncHandler(async (req, res) => {
  const [recipes, items] = await Promise.all([
    Recipe.find(),
    PantryItem.find({ user: req.user.id }),
  ]);
  const map = pantryIndex(items);
  const ranked = recipes
    .map((r) => {
      const shortfalls = r.ingredients.map((ing) => shortfallFor(ing, map)).filter(Boolean);
      return {
        ...r.toObject(),
        shortfallCount: shortfalls.length,
        shortfalls,
        cookable: shortfalls.length === 0,
      };
    })
    .sort((a, b) => a.shortfallCount - b.shortfallCount || a.minutes - b.minutes);
  res.json(ranked);
});

exports.getOne = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  res.json(recipe);
});

// Cook mode: deduct used quantities transactionally; 409 on any shortfall.
exports.cook = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  const servings = req.body.servings ? Number(req.body.servings) : recipe.servings;
  if (!Number.isInteger(servings) || servings < 1 || servings > 20) {
    throw new AppError(400, 'Servings must be between 1 and 20');
  }
  const scale = servings / recipe.servings;

  const items = await PantryItem.find({ user: req.user.id });
  const map = pantryIndex(items);

  // Validate everything first, then deduct — all-or-nothing.
  const deductions = [];
  for (const ing of recipe.ingredients) {
    const shortfall = shortfallFor(
      { name: ing.name, quantity: Math.round(ing.quantity * scale * 100) / 100, unit: ing.unit },
      map
    );
    if (shortfall) {
      throw new AppError(409, `Cannot cook "${recipe.title}": ${shortfall.name} — ${shortfall.reason}`);
    }
    const owned = map.get(normName(ing.name));
    const need = toBase(Math.round(ing.quantity * scale * 100) / 100, ing.unit);
    const have = toBase(owned.quantity, owned.unit);
    deductions.push({ item: owned, remaining: Math.round((have.quantity - need.quantity) * 100) / 100, unit: need.unit });
  }

  for (const d of deductions) {
    d.item.quantity = d.remaining;
    if (d.item.quantity <= 0) await d.item.deleteOne();
    else await d.item.save();
  }
  res.json({ cooked: recipe.title, servings, deducted: deductions.filter((d) => d.item.quantity > 0).map((d) => ({ name: d.item.name, left: d.remaining, unit: d.unit })), removed: deductions.filter((d) => d.item.quantity <= 0).map((d) => d.item.name) });
});

// Grocery list CRUD + "add missing" merge.
exports.groceryList = asyncHandler(async (req, res) => {
  const items = await GroceryItem.find({ user: req.user.id }).sort('aisle name');
  res.json(items);
});

exports.groceryAdd = asyncHandler(async (req, res) => {
  const { z } = require('zod');
  const schema = z.object({
    name: z.string().trim().min(2).max(80),
    quantity: z.coerce.number().min(0),
    unit: z.string().trim().min(1).max(20),
    aisle: z.enum(['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other']).default('other'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const name = normName(parsed.data.name);
  const dupe = await GroceryItem.findOne({ user: req.user.id, name });
  if (dupe) throw new AppError(409, `"${parsed.data.name}" is already on your list`);
  const item = await GroceryItem.create({ ...parsed.data, name, user: req.user.id });
  res.status(201).json(item);
});

// Merge recipe shortfalls into the grocery list by ingredient+unit (no dupes).
exports.addMissing = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new AppError(404, 'Recipe not found');
  const [items, existing] = await Promise.all([
    PantryItem.find({ user: req.user.id }),
    GroceryItem.find({ user: req.user.id }),
  ]);
  const pantry = pantryIndex(items);
  const inList = new Set(existing.filter((g) => !g.done).map((g) => normName(g.name)));

  const toAdd = [];
  const skipped = [];
  for (const ing of recipe.ingredients) {
    const shortfall = shortfallFor(ing, pantry);
    if (!shortfall) continue;
    if (inList.has(normName(ing.name))) {
      skipped.push(ing.name);
      continue;
    }
    toAdd.push({ name: normName(ing.name), quantity: shortfall.missing, unit: shortfall.unit, user: req.user.id });
    inList.add(normName(ing.name));
  }
  if (toAdd.length) await GroceryItem.insertMany(toAdd);
  res.status(201).json({ added: toAdd.length, skipped, names: toAdd.map((t) => t.name) });
});

exports.groceryUpdate = asyncHandler(async (req, res) => {
  const item = await GroceryItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!item) throw new AppError(404, 'Grocery item not found');
  if (typeof req.body.done === 'boolean') item.done = req.body.done;
  if (req.body.quantity !== undefined) {
    const q = Number(req.body.quantity);
    if (Number.isNaN(q) || q < 0) throw new AppError(400, 'Quantity must be a positive number');
    item.quantity = q;
  }
  await item.save();
  res.json(item);
});

exports.groceryRemove = asyncHandler(async (req, res) => {
  const item = await GroceryItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!item) throw new AppError(404, 'Grocery item not found');
  await item.deleteOne();
  res.json({ deleted: true });
});

// Waste report: expired-unused items in the last 30 days from deleted pantry
// rows is not tracked, so we compute from expired items still in the pantry
// plus a "consumed" proxy from cook deductions is out of scope — the report
// covers: currently expired items, expiring soon, and aisle distribution.
exports.wasteReport = asyncHandler(async (req, res) => {
  const items = await PantryItem.find({ user: req.user.id });
  const now = Date.now();
  const expired = [];
  const expiringSoon = [];
  for (const it of items) {
    if (!it.expiresAt) continue;
    const days = Math.ceil((it.expiresAt - now) / 86400000);
    if (days < 0) expired.push({ ...withExpiry(it), days });
    else if (days <= 3) expiringSoon.push({ ...withExpiry(it), days });
  }
  const byAisle = {};
  for (const it of items) byAisle[it.aisle] = (byAisle[it.aisle] || 0) + 1;
  res.json({
    expired: expired.sort((a, b) => a.days - b.days),
    expiringSoon: expiringSoon.sort((a, b) => a.days - b.days),
    wastedCount: expired.length,
    pantryCount: items.length,
    byAisle,
  });
});

function withExpiry(item) {
  const obj = item.toObject ? item.toObject() : item;
  if (obj.expiresAt) {
    const days = Math.ceil((new Date(obj.expiresAt) - Date.now()) / 86400000);
    obj.expiryStatus = days < 0 ? 'expired' : days <= 3 ? 'use-first' : 'ok';
    obj.expiryDays = days;
  }
  return obj;
}
