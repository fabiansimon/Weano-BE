import { ApolloError, AuthenticationError } from "apollo-server-express";
import PackingItem from "../models/PackingItem.model.js";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";

export const deletePackingItem = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    await PackingItem.findByIdAndDelete(id);

    await Trip.findByIdAndUpdate(tripId, {
      $pull: { packingItems: id },
    });

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
