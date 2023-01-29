import { ApolloError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const getInvitationTripData = async (_, { tripId }) => {
  try {
    const { title, description, dateRange, location, hostId } =
      await Trip.findById(tripId);
    const { firstName } = await User.findById(hostId);

    return {
      title,
      description,
      dateRange,
      location,
      hostName: firstName,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
