import { ApolloError, AuthenticationError } from "apollo-server-express";
import Task from "../models/Task.model.js";

export const updateTask = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { taskId, isDone } = args.data;

    const task = await Task.findByIdAndUpdate(taskId, {
      isDone,
    });

    if (!task) {
      throw new ApolloError("No task found with that ID");
    }

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
