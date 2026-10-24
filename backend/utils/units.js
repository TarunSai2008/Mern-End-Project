// Normalize ingredient names and convert between compatible units so pantry
// matching works across "grams"/"g" and "ml"/"millilitre" style variants.
const UNIT_ALIASES = {
  g: 'g', gram: 'g', grams: 'g', gm: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', millilitre: 'ml', milliliter: 'ml',
  l: 'l', litre: 'l', liter: 'l',
  pc: 'pc', piece: 'pc', pieces: 'pc', count: 'pc', nos: 'pc',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  cup: 'cup', cups: 'cup',
  bunch: 'bunch', bunches: 'bunch',
  pack: 'pack', packet: 'pack', packs: 'pack',
};

const COMPATIBLE_GROUPS = [
  ['g', 'kg'],
  ['ml', 'l'],
];

function normName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function normUnit(unit) {
  return UNIT_ALIASES[String(unit).toLowerCase().trim()] || String(unit).toLowerCase().trim();
}

function compatible(unitA, unitB) {
  const a = normUnit(unitA);
  const b = normUnit(unitB);
  if (a === b) return true;
  return COMPATIBLE_GROUPS.some((grp) => grp.includes(a) && grp.includes(b));
}

function toBase(quantity, unit) {
  const u = normUnit(unit);
  if (u === 'kg') return { unit: 'g', quantity: quantity * 1000 };
  if (u === 'l') return { unit: 'ml', quantity: quantity * 1000 };
  return { unit: u, quantity };
}

module.exports = { normName, normUnit, compatible, toBase, UNIT_ALIASES };
