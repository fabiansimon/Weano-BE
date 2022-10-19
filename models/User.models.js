import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
    },
    trips: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);

export default User;
