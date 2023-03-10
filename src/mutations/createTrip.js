import { ApolloError, AuthenticationError } from "apollo-server-express";
import Poll from "../models/Poll.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const createTrip = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, location, dateRange } = args.trip;

    const poll = new Poll({
      creatorId: userId,
      title: "Destination options",
      description: "",
    });

    const { _id: pollId } = await poll.save();

    const totalLocation = {
      ...location,
      votedBy: [],
    };

    const trip = new Trip({
      hostId: userId,
      title,
      description: "",
      location: totalLocation,
      dateRange,
      activeMembers: [userId],
      destinationPoll: pollId.toString(),
      assignedImages: [],
      currency: {
        symbol: '$',
        string: 'USD',
      }
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
