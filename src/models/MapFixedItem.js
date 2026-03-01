const mongoose = require('mongoose');

const MapFixedItemSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  icon:  { type: String, required: true },
  floor: { type: Number, required: true, default: 0 },
  x:     { type: Number, required: true },   // % from left
  y:     { type: Number, required: true },   // % from top
  w:     { type: Number, required: true },   // px width
  h:     { type: Number, required: true },   // px height
  type:  { type: String, enum: ['area', 'point'], default: 'point' },
  style: { type: String, default: 'bg-gray-100/90 border-gray-400 text-gray-700' },
}, { timestamps: true });

module.exports = mongoose.model('MapFixedItem', MapFixedItemSchema);
