import { ApolloError, AuthenticationError } from "apollo-server-express";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";
import TripController from "../controllers/TripController.js";

export const createTask = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { title, tripId, assignee, isPrivate = false } = args.task;

    const { dateRange } = await Trip.findById(tripId);

    const type = TripController.getTripTypeFromDate(dateRange);

    if (type === "recent") {
      throw new ApolloError("Can't create a task after the trip is done");
    }

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
