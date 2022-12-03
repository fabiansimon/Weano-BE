import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    assignee: {
      type: String,
    },
    title: {
      type: String,
      require: true,
    },
    isDone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("task", TaskSchema);

export default Task;
