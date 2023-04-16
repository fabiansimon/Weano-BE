import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const removeUserFromTrip = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id: removeUserId, tripId } = args.data;

    try {
      const { hostId } = await Trip.findById(tripId);

      if (hostId !== userId && removeUserId !== userId) {
        throw new ApolloError("Must be host to proceed");
      }

      const { activeMembers } = await Trip.findByIdAndUpdate(tripId, {
        $pull: { activeMembers: removeUserId },
      });

      if (removeUserId === hostId) {
        const newHost = activeMembers.find((member) => member.id !== removeUserId) || '';
        await Trip.findByIdAndUpdate(tripId, { 
          hostId: newHost
        });
      }
      
      await User.findByIdAndUpdate(removeUserId, {
        $pull: { trips: tripId },
      });

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
