const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');

let ctx, arav, recipeIds;

before(async () => {
  ctx = await startTest();
  arav = await login(ctx, 'arav@demo.com');
  const recipes = await api(ctx, 'GET', '/recipes', { token: arav.token });
  recipeIds = recipes.body.slice(0, 4).map((r) => r._id);
});

after(async () => stopTest(ctx));

test('meal plan aggregates ingredients across recipes and nets out pantry', async () => {
  const r = await api(ctx, 'POST', '/mealplan', { token: arav.token, body: { recipeIds } });
  assert.equal(r.status, 200);
  assert.ok(r.body.shoppingList.length >= 1);
  assert.ok(r.body.coveredFromPantry >= 1, 'salt etc. should be covered by pantry');
  // every shortfall cites which recipes need it
  assert.ok(r.body.shoppingList.every((i) => i.recipes.length >= 1));
  ctx.shopping = r.body.shoppingList;
});

test('pushing the plan merges into the grocery list without duplicates', async () => {
  const items = ctx.shopping.map((s) => ({ name: s.name, quantity: s.quantity, unit: s.unit }));
  const r1 = await api(ctx, 'POST', '/mealplan/push', { token: arav.token, body: { items } });
  assert.equal(r1.status, 201);
  assert.ok(r1.body.added >= 1);
  const r2 = await api(ctx, 'POST', '/mealplan/push', { token: arav.token, body: { items } });
  assert.equal(r2.body.added, 0, 'second push adds nothing new');
  const list = await api(ctx, 'GET', '/grocery', { token: arav.token });
  const names = list.body.map((g) => g.name);
  assert.equal(new Set(names).size, names.length);
});
