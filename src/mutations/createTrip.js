import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const createTrip = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, destination, dateRange } = args.trip;

    const trip = new Trip({
      hostIds: [userId],
      title,
      description: "",
      destinations: [destination],
      dateRange,
      activeMembers: [userId],
      assignedImages: [],
      currency: {
        symbol: "$",
        string: "USD",
      },
    });

    const { _id } = await trip.save();

    await User.findByIdAndUpdate(userId, {
      $push: { trips: _id.toString() },
    });
    return _id;
  } catch (error) {
    throw new ApolloError(error);
  }
};
