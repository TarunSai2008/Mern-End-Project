const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const a = require('../controllers/auth.controller');
const p = require('../controllers/pantry.controller');
const r = require('../controllers/recipe.controller');
const extra = require('../controllers/extra.controller');
const { requireAuth } = require('../middlewares/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post('/auth/register', authLimiter, a.register);
router.post('/auth/login', authLimiter, a.login);
router.get('/auth/me', requireAuth, a.me);

router.use(requireAuth);
router.get('/pantry', p.list);
router.post('/pantry', p.create);
router.patch('/pantry/:id', p.update);
router.delete('/pantry/:id', p.remove);

router.get('/recipes', r.list);
router.get('/recipes/match', r.match);
router.get('/recipes/:id', r.getOne);
router.post('/recipes/:id/cook', r.cook);
router.post('/recipes/:id/add-missing', r.addMissing);

router.get('/grocery', r.groceryList);
router.post('/grocery', r.groceryAdd);
router.patch('/grocery/:id', r.groceryUpdate);
router.delete('/grocery/:id', r.groceryRemove);

router.get('/reports/waste', r.wasteReport);
router.post('/mealplan', extra.plan);
router.post('/mealplan/push', extra.pushPlan);

module.exports = router;
