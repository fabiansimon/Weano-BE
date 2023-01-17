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
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUri: {
      type: String,
    },
    images: {
      type: Array,
    },
    trips: {
      type: Array,
    },
    expenses: {
      type: Array,
    },
    pushToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", UserSchema);

export default User;