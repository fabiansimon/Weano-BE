import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import Image from "../models/Image.model.js";
import User from "../models/User.model.js";

export const deleteImage = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    try {
      await Image.findByIdAndDelete(id);
      await User.findByIdAndUpdate(userId, {
        $pull: { images: id },
      });
      await Trip.findByIdAndUpdate(tripId, {
        $pull: { images: id },
      });

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
