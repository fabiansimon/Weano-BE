import mongoose from "mongoose";

const PollSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    options: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Poll = mongoose.model("poll", PollSchema);

export default Poll;
