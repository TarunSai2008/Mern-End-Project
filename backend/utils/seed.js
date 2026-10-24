const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const PantryItem = require('../models/PantryItem.model');
const Recipe = require('../models/Recipe.model');
const GroceryItem = require('../models/GroceryItem.model');

const DEMO_PASSWORD = 'Demo@1234';

const RECIPES = [
  { title: 'Masala Omelette', servings: 1, minutes: 10, ingredients: [{ name: 'eggs', quantity: 2, unit: 'pc' }, { name: 'onion', quantity: 0.5, unit: 'pc' }, { name: 'green chilli', quantity: 1, unit: 'pc' }, { name: 'butter', quantity: 10, unit: 'g' }, { name: 'salt', quantity: 1, unit: 'tsp' }], steps: ['Whisk eggs with chopped onion and chilli', 'Melt butter, pour, cook 3 min'] },
  { title: 'Pasta Aglio e Olio', servings: 2, minutes: 20, ingredients: [{ name: 'spaghetti', quantity: 200, unit: 'g' }, { name: 'garlic', quantity: 6, unit: 'pc' }, { name: 'olive oil', quantity: 4, unit: 'tbsp' }, { name: 'chilli flakes', quantity: 1, unit: 'tsp' }, { name: 'salt', quantity: 1, unit: 'tbsp' }], steps: ['Boil pasta al dente', 'Slow-cook garlic in oil', 'Toss with chilli flakes'] },
  { title: 'Vegetable Pulao', servings: 3, minutes: 35, ingredients: [{ name: 'basmati rice', quantity: 300, unit: 'g' }, { name: 'onion', quantity: 1, unit: 'pc' }, { name: 'carrot', quantity: 1, unit: 'pc' }, { name: 'green peas', quantity: 100, unit: 'g' }, { name: 'ghee', quantity: 2, unit: 'tbsp' }, { name: 'garam masala', quantity: 1, unit: 'tsp' }], steps: ['Fry onions in ghee', 'Add veggies and rice', 'Cook 1:1.5 with water'] },
  { title: 'Tomato Rasam', servings: 4, minutes: 25, ingredients: [{ name: 'tomato', quantity: 3, unit: 'pc' }, { name: 'tamarind', quantity: 20, unit: 'g' }, { name: 'rasam powder', quantity: 2, unit: 'tbsp' }, { name: 'curry leaves', quantity: 1, unit: 'bunch' }, { name: 'mustard seeds', quantity: 1, unit: 'tsp' }], steps: ['Boil tomato + tamarind water', 'Temper mustard & curry leaves'] },
  { title: 'Paneer Butter Masala', servings: 2, minutes: 40, ingredients: [{ name: 'paneer', quantity: 200, unit: 'g' }, { name: 'tomato', quantity: 4, unit: 'pc' }, { name: 'butter', quantity: 40, unit: 'g' }, { name: 'cream', quantity: 100, unit: 'ml' }, { name: 'garam masala', quantity: 1, unit: 'tsp' }, { name: 'salt', quantity: 1, unit: 'tsp' }], steps: ['Blend and cook tomato gravy', 'Add paneer, butter, cream'] },
  { title: 'Curd Rice', servings: 2, minutes: 15, ingredients: [{ name: 'cooked rice', quantity: 300, unit: 'g' }, { name: 'curd', quantity: 300, unit: 'g' }, { name: 'mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'curry leaves', quantity: 1, unit: 'bunch' }, { name: 'salt', quantity: 1, unit: 'tsp' }], steps: ['Mix rice and curd', 'Temper mustard and curry leaves'] },
  { title: 'Banana Smoothie', servings: 1, minutes: 5, ingredients: [{ name: 'banana', quantity: 2, unit: 'pc' }, { name: 'curd', quantity: 150, unit: 'g' }, { name: 'honey', quantity: 1, unit: 'tbsp' }], steps: ['Blend everything'] },
  { title: 'Masala Chai', servings: 2, minutes: 10, ingredients: [{ name: 'tea powder', quantity: 2, unit: 'tsp' }, { name: 'milk', quantity: 300, unit: 'ml' }, { name: 'ginger', quantity: 10, unit: 'g' }, { name: 'sugar', quantity: 2, unit: 'tsp' }], steps: ['Boil milk with ginger', 'Add tea, strain'] },
  { title: 'Aloo Paratha', servings: 2, minutes: 30, ingredients: [{ name: 'wheat flour', quantity: 250, unit: 'g' }, { name: 'potato', quantity: 2, unit: 'pc' }, { name: 'ghee', quantity: 3, unit: 'tbsp' }, { name: 'salt', quantity: 1, unit: 'tsp' }], steps: ['Knead dough', 'Stuff spiced mash, roast'] },
  { title: 'Lemon Rice', servings: 2, minutes: 20, ingredients: [{ name: 'cooked rice', quantity: 300, unit: 'g' }, { name: 'lemon', quantity: 1, unit: 'pc' }, { name: 'mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'curry leaves', quantity: 1, unit: 'bunch' }, { name: 'cashews', quantity: 30, unit: 'g' }], steps: ['Temper everything, toss rice'] },
  { title: 'Grilled Cheese', servings: 1, minutes: 10, ingredients: [{ name: 'bread', quantity: 2, unit: 'pc' }, { name: 'cheese', quantity: 50, unit: 'g' }, { name: 'butter', quantity: 10, unit: 'g' }], steps: ['Butter bread, grill with cheese'] },
  { title: 'Onion Pakoda', servings: 4, minutes: 25, ingredients: [{ name: 'onion', quantity: 2, unit: 'pc' }, { name: 'gram flour', quantity: 150, unit: 'g' }, { name: 'chilli flakes', quantity: 1, unit: 'tsp' }, { name: 'oil', quantity: 300, unit: 'ml' }], steps: ['Slice onions, coat in batter', 'Deep fry till golden'] },
  { title: 'Veg Sandwich', servings: 2, minutes: 15, ingredients: [{ name: 'bread', quantity: 4, unit: 'pc' }, { name: 'cucumber', quantity: 1, unit: 'pc' }, { name: 'tomato', quantity: 1, unit: 'pc' }, { name: 'cheese', quantity: 40, unit: 'g' }], steps: ['Layer, toast'] },
  { title: 'Dal Tadka', servings: 3, minutes: 30, ingredients: [{ name: 'toor dal', quantity: 200, unit: 'g' }, { name: 'ghee', quantity: 2, unit: 'tbsp' }, { name: 'cumin seeds', quantity: 1, unit: 'tsp' }, { name: 'onion', quantity: 1, unit: 'pc' }, { name: 'turmeric', quantity: 0.5, unit: 'tsp' }], steps: ['Pressure cook dal', 'Temper cumin-onion in ghee'] },
  { title: 'Poha', servings: 2, minutes: 15, ingredients: [{ name: 'poha', quantity: 200, unit: 'g' }, { name: 'onion', quantity: 1, unit: 'pc' }, { name: 'mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'curry leaves', quantity: 1, unit: 'bunch' }, { name: 'lemon', quantity: 0.5, unit: 'pc' }], steps: ['Rinse poha', 'Temper, toss gently'] },
  { title: 'Mango Lassi', servings: 2, minutes: 5, ingredients: [{ name: 'mango', quantity: 1, unit: 'pc' }, { name: 'curd', quantity: 250, unit: 'g' }, { name: 'honey', quantity: 1, unit: 'tbsp' }], steps: ['Blend, chill'] },
  { title: 'French Toast', servings: 2, minutes: 15, ingredients: [{ name: 'bread', quantity: 4, unit: 'pc' }, { name: 'eggs', quantity: 2, unit: 'pc' }, { name: 'milk', quantity: 100, unit: 'ml' }, { name: 'butter', quantity: 15, unit: 'g' }], steps: ['Dip and fry'] },
  { title: 'Cucumber Raita', servings: 3, minutes: 10, ingredients: [{ name: 'curd', quantity: 250, unit: 'g' }, { name: 'cucumber', quantity: 1, unit: 'pc' }, { name: 'cumin seeds', quantity: 0.5, unit: 'tsp' }, { name: 'salt', quantity: 0.5, unit: 'tsp' }], steps: ['Grate, mix, chill'] },
  { title: 'Bread Upma', servings: 2, minutes: 20, ingredients: [{ name: 'bread', quantity: 6, unit: 'pc' }, { name: 'onion', quantity: 1, unit: 'pc' }, { name: 'mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'turmeric', quantity: 0.5, unit: 'tsp' }], steps: ['Crumble bread, toss with tempering'] },
  { title: 'Gulab Jamun (from mix)', servings: 4, minutes: 25, ingredients: [{ name: 'jamun mix', quantity: 100, unit: 'g' }, { name: 'milk', quantity: 100, unit: 'ml' }, { name: 'sugar', quantity: 200, unit: 'g' }], steps: ['Knead, fry, soak in syrup'] },
];

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const arav = await User.create({ name: 'Arav Menon', email: 'arav@demo.com', passwordHash: hash });

  const dayMs = 24 * 60 * 60 * 1000;
  const days = (d) => new Date(Date.now() + d * dayMs);

  const pantry = [
    { name: 'eggs', quantity: 6, unit: 'pc', aisle: 'dairy', expiresAt: days(5) },
    { name: 'onion', quantity: 3, unit: 'pc', aisle: 'produce', expiresAt: days(7) },
    { name: 'tomato', quantity: 5, unit: 'pc', aisle: 'produce', expiresAt: days(2) },        // use-first
    { name: 'curd', quantity: 400, unit: 'g', aisle: 'dairy', expiresAt: days(-1), opened: true }, // expired
    { name: 'milk', quantity: 500, unit: 'ml', aisle: 'dairy', expiresAt: days(3), opened: true },
    { name: 'butter', quantity: 90, unit: 'g', aisle: 'dairy', expiresAt: days(20) },
    { name: 'cheese', quantity: 120, unit: 'g', aisle: 'dairy', expiresAt: days(14) },
    { name: 'bread', quantity: 8, unit: 'pc', aisle: 'bakery', expiresAt: days(2) },          // use-first
    { name: 'basmati rice', quantity: 1000, unit: 'g', aisle: 'dry goods' },
    { name: 'cooked rice', quantity: 400, unit: 'g', aisle: 'other', expiresAt: days(1) },
    { name: 'toor dal', quantity: 500, unit: 'g', aisle: 'dry goods' },
    { name: 'gram flour', quantity: 300, unit: 'g', aisle: 'dry goods' },
    { name: 'poha', quantity: 250, unit: 'g', aisle: 'dry goods' },
    { name: 'spaghetti', quantity: 250, unit: 'g', aisle: 'dry goods' },
    { name: 'wheat flour', quantity: 1000, unit: 'g', aisle: 'dry goods' },
    { name: 'sugar', quantity: 400, unit: 'g', aisle: 'dry goods' },
    { name: 'salt', quantity: 200, unit: 'g', aisle: 'spices' },
    { name: 'turmeric', quantity: 50, unit: 'g', aisle: 'spices' },
    { name: 'mustard seeds', quantity: 80, unit: 'g', aisle: 'spices' },
    { name: 'cumin seeds', quantity: 60, unit: 'g', aisle: 'spices' },
    { name: 'garam masala', quantity: 70, unit: 'g', aisle: 'spices' },
    { name: 'chilli flakes', quantity: 40, unit: 'g', aisle: 'spices' },
    { name: 'olive oil', quantity: 400, unit: 'ml', aisle: 'other' },
    { name: 'cucumber', quantity: 2, unit: 'pc', aisle: 'produce', expiresAt: days(4) },
    { name: 'banana', quantity: 3, unit: 'pc', aisle: 'produce', expiresAt: days(3) },
    { name: 'lemon', quantity: 2, unit: 'pc', aisle: 'produce', expiresAt: days(10) },
    { name: 'garlic', quantity: 10, unit: 'pc', aisle: 'produce' },
    { name: 'curry leaves', quantity: 2, unit: 'bunch', aisle: 'produce', expiresAt: days(3) },
  ];
  await PantryItem.insertMany(pantry.map((p) => ({ ...p, user: arav._id, purchasedAt: days(-3) })));
  await Recipe.insertMany(RECIPES);
  await GroceryItem.create({ user: arav._id, name: 'tea powder', quantity: 100, unit: 'g', aisle: 'other' });

  return { arav };
}

module.exports = seed;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
