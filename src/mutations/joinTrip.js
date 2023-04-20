import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const joinTrip = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const user = userId.toString();

    const trip = await Trip.findById(tripId);

    const type = TripController.getTripTypeFromDate(trip.dateRange);

    if (type === "recent") {
      throw new ApolloError("Can't join a trip after the trip is done");
    }

    if (!trip) {
      throw new ApolloError("Trip ID not valid");
    }

    const { activeMembers } = trip;

    if (activeMembers.includes(user)) {
      throw new ApolloError("User already added to Trip");
    }

    const { _id } = await Trip.findByIdAndUpdate(tripId, {
      $push: { activeMembers: user },
    });

    await User.findByIdAndUpdate(userId, {
      $push: { trips: _id.toString() },
    });

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
