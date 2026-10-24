const { z } = require('zod');
const PantryItem = require('../models/PantryItem.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { normName } = require('../utils/units');

const AISLES = ['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other'];

const itemSchema = z.object({
  name: z.string().trim().min(2, 'Name the ingredient').max(80),
  quantity: z.coerce.number().min(0, 'Quantity can not be negative'),
  unit: z.string().trim().min(1).max(20),
  aisle: z.enum(AISLES).default('other'),
  expiresAt: z.coerce.date().optional(),
  opened: z.boolean().default(false),
});

const updateSchema = itemSchema.partial();

function withExpiry(item) {
  const obj = item.toObject ? item.toObject() : item;
  if (obj.expiresAt) {
    const days = Math.ceil((new Date(obj.expiresAt) - Date.now()) / 86400000);
    obj.expiryStatus = days < 0 ? 'expired' : days <= 3 ? 'use-first' : 'ok';
    obj.expiryDays = days;
  }
  return obj;
}

exports.list = asyncHandler(async (req, res) => {
  const items = await PantryItem.find({ user: req.user.id }).sort('expiresAt name');
  res.json(items.map(withExpiry));
});

exports.create = asyncHandler(async (req, res) => {
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const name = normName(parsed.data.name);
  const dupe = await PantryItem.findOne({ user: req.user.id, name });
  if (dupe) throw new AppError(409, `"${parsed.data.name}" is already in your pantry — edit its quantity instead`);
  const item = await PantryItem.create({ ...parsed.data, name, user: req.user.id });
  res.status(201).json(withExpiry(item));
});

exports.update = asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const item = await PantryItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!item) throw new AppError(404, 'Pantry item not found');
  if (parsed.data.name) parsed.data.name = normName(parsed.data.name);
  Object.assign(item, parsed.data);
  await item.save();
  res.json(withExpiry(item));
});

exports.remove = asyncHandler(async (req, res) => {
  const item = await PantryItem.findOne({ _id: req.params.id, user: req.user.id });
  if (!item) throw new AppError(404, 'Pantry item not found');
  await item.deleteOne();
  res.json({ deleted: true });
});
