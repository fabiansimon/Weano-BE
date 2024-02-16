import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const deleteUser = async (_, __, { userId: {userId} }) => {
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
        $pull: { activeMembers: userId  },
      });

      if (!tripData) {
        return;
      }

      const { activeMembers, hostIds } = tripData;
      
      if (hostIds.length <= 1 && hostIds[0] === userId) {
        await Trip.findByIdAndUpdate(trip, {
           hostIds: [activeMembers[0]] 
        });
      } 

      if (hostIds.length > 1 && hostIds.includes(userId)) {
        await Trip.findByIdAndUpdate(trip, {
          $pull: { hostIds: userId },
       });
      }
    });

    await User.findByIdAndDelete(userId);

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
