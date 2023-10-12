import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema([{
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  description: {
    type: String,
    index: true,
    required: 'Description is required'
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,

  salt: String
}]);

export default mongoose.model('Category', CategorySchema);