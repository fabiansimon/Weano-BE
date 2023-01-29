import { ApolloError, AuthenticationError } from "apollo-server-express";
import Poll from "../models/Poll.model.js";
import Trip from "../models/Trip.model.js";

export const deletePoll = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    try {
      await Poll.findByIdAndDelete(id);
      await Trip.findByIdAndUpdate(tripId, {
        $pull: { polls: id },
      });

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
