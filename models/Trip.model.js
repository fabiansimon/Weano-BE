import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    hostId: {
      type: String,
      required: true,
    },
    thumbnailUri: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
    expenses: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("trip", TripSchema);

export default Trip;
