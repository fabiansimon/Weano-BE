import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import Document from "../models/Document.model.js";
import TripController from "../controllers/TripController.js";

export const deleteDocument = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    try {
      const {creatorId, s3Key} = await Document.findById(id);

      await TripController.deleteBucketItem(s3Key);  

      // if (creatorId !== userId ||) {
      //   throw new AuthenticationError("Cannot delete this item");
      // }

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
