import { ApolloError, AuthenticationError } from "apollo-server-express";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";

export const deleteTask = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId, isPrivate = false } = args.data;

    try {
      await Task.findByIdAndDelete(id);

      if (isPrivate) {
        await Trip.findByIdAndUpdate(tripId, {
          $pull: { privateTasks: id },
        });
      } else {
        await Trip.findByIdAndUpdate(tripId, {
          $pull: { mutualTasks: id },
        });
      }

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
