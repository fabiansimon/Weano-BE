import { ApolloError, AuthenticationError } from "apollo-server-express";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";

export const createTask = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { title, tripId, assignee, isPrivate = false } = args.task;

    const task = new Task({
      creatorId: userId,
      assignee,
      title,
    });

    const { _id } = await task.save();

    if (isPrivate) {
      await Trip.findByIdAndUpdate(tripId, {
        $push: { privateTasks: _id.toString() },
      });
    } else {
      await Trip.findByIdAndUpdate(tripId, {
        $push: { mutualTasks: _id.toString() },
      });
    }

    return _id;
  } catch (error) {
    throw new ApolloError(error);
  }
};
