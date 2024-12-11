const mongoose = require('../data/database').mongoose;
const { Schema } = mongoose;

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    ingredients: {
      type: [String],
      required: [true, 'Ingredients must be a non-empty list'],
      validate: [arrayLimit, 'Ingredients list cannot be empty'],
    },
    instructions: {
      type: [String],
      required: [true, 'Instructions must be a non-empty list'],
      validate: [arrayLimit, 'Instructions list cannot be empty'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Valid categoryId is required'],
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publisher',
      required: [true, 'Valid publisherId is required'],
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          comment: String,
          rating: Number,
        },
      ],
      default: [],
    },
    image: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val && val.length > 0;
}

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
