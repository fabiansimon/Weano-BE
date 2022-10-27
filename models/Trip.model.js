import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    invitees: {
      type: Array,
      required: true,
    },
    activeMembers: {
      type: Array,
      required: true,
    },
    dateRange: {
      startDate: {
        type: Number,
      },
      endDate: {
        type: Number,
      },
    },
    images: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("trip", TripSchema);

export default Trip;
