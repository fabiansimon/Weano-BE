import mongoose from "mongoose";

const ImageScheme = new mongoose.Schema(
  {
    uri: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    author: {
      type: String,
      required: true,
    },
    tripId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Image = mongoose.model("image", ImageScheme);

export default Image;
