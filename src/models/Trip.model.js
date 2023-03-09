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
      placeName: {
        type: String,
      },
      latlon: {
        type: Array,
      },
    },
    destinationPoll: {
      type: String,
    },
    mutualTasks: {
      type: Array,
    },
    privateTasks: {
      type: Array,
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
    polls: {
      type: Array,
    },
    assignedImages: {
      type: Array,
    },
    documents: {
      type: Array,
    },
    packingItems: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("trip", TripSchema);

export default Trip;
