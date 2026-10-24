const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    servings: { type: Number, required: true, min: 1 },
    minutes: { type: Number, required: true, min: 1 },
    ingredients: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true },
        _id: false,
      },
    ],
    steps: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
