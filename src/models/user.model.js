import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  provider: {
    type: String,
    enum: ['google', 'github', 'password'],
  },
  role: {
    type: Number, // Following bsonType: 'int' from JSON
    enum: [0, 1, 2], // Mapping: 0: user, 1: shop, 2: admin? 
    // Wait, the JSON says enum: ["admin", "shop", "user"]. 
    // I'll use strings for now as it's more readable, but if the user insisted on int I'd map them.
    // Actually, I will use strings and if they want int I'll suggest a mapping.
    // Let's re-read: "role": { "enum": ["admin","shop","user"],"bsonType": "int" }
    // If it's an int, then the enum should have been [1, 2, 3] or similar.
    // I'll go with Number and add comments.
    default: 0
  }
}, {
  timestamps: true,
});

// Mapping strings to ints for the role
export const ROLES = {
  USER: 0,
  SHOP: 1,
  ADMIN: 2
};

const User = mongoose.model('User', userSchema);

export default User;
