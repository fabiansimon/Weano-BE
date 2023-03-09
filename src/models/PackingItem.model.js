import mongoose from "mongoose";

const PackingItemSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
    },
    isPacked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PackingItem = mongoose.model("packingItem", PackingItemSchema);

export default PackingItem;
