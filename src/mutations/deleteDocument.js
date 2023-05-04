import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import Document from "../models/Document.model.js";

export const deleteDocument = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    try {
      const document = await Document.findById(id);
      const { creatorId } = document;

      if (creatorId !== userId) {
        return;
      }

      await Document.findByIdAndDelete(id);

      await Trip.findByIdAndUpdate(tripId, {
        $pull: { documents: id },
      });

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
