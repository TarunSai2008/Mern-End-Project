const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 20 },
    aisle: { type: String, enum: ['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other'], default: 'other' },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    opened: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// same user can't have two rows of the same ingredient
pantryItemSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('PantryItem', pantryItemSchema);
