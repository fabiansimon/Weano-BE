import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import TripController from "../controllers/TripController.js";

export const removeUserFromTrip = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id: removeUserId, tripId } = args.data;

    try {
      const isHost = await TripController.isUserHost(userId, tripId);

      if (!isHost && removeUserId !== userId) {
        throw new ApolloError("Must be host to proceed");
      }

      const { activeMembers, hostIds } = await Trip.findByIdAndUpdate(tripId, {
        $pull: { activeMembers: removeUserId },
      });

      if (hostIds.includes(removeUserId)) {

        if (hostIds.length <= 1 && activeMembers.length > 1) {
          const newHost = activeMembers.find((member) => member !== removeUserId) || '';
          await Trip.findByIdAndUpdate(tripId, { 
            hostIds: [newHost]
          });
        } else {
          const newHosts = hostIds.filter((host) => host !== removeUserId);
          await Trip.findByIdAndUpdate(tripId, { 
            hostIds: newHosts
          });
        }
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
