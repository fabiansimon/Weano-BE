import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const deleteUser = async (_, __, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const user = await User.findById(userId);

    const { trips } = user;

    await trips.forEach(async (trip) => {
      // const tripExpenses = expenses
      //   .map((e) => {
      //     if (e.trip === trip) {
      //       return e.expense;
      //     }
      //   })
      //   .filter(Boolean);

      const tripData = await Trip.findByIdAndUpdate(trip, {
        $pull: { activeMembers: { userId } },
      });

      if (!tripData) {
        return;
      }

      const { _id, activeMembers, hostId } = tripData;

      // Check if it was last user || if not reassign host
      if (activeMembers.length <= 0) {
        await Trip.findByIdAndDelete(_id.toString());
      } else if (hostId === userId) {
        await Trip.findByIdAndUpdate(trip, {
          $set: { hostId: activeMembers[0] },
        });
      }
    });

    await User.findByIdAndDelete(userId);

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
