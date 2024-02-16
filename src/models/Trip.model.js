import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    hostIds: {
      type: Array,
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
    destinations: {
      type: Array,
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
    currency: {
      symbol: {
        type: String,
      },
      string: {
        type: String,
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
    chatRoomId: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    budget: {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("trip", TripSchema);

export default Trip;
