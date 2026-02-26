import mongoose from 'mongoose';

const boxRequestSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ASSIGNED', 'REJECTED'],
    default: 'PENDING',
  },
  assignedBox: {
    type: String, // or ObjectId if you have a Box model
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('BoxRequest', boxRequestSchema);