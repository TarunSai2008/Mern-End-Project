const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    aisle: { type: String, enum: ['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other'], default: 'other' },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

groceryItemSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('GroceryItem', groceryItemSchema);
