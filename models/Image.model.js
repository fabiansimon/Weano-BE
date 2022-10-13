import mongoose from 'mongoose';

const ImageScheme = new mongoose.Schema({
  imageUri: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
},
  {
    timestamps: true,
  }
);

const Image = mongoose.model('image', ImageScheme);

export default Image;
