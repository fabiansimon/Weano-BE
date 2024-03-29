import { ApolloError, AuthenticationError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import Poll from "../models/Poll.model.js";
import Trip from "../models/Trip.model.js";
import TripController from "../controllers/TripController.js";

export const createPoll = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { title, description, tripId, options } = args.poll;

    const { dateRange } = await Trip.findById(tripId);

    const type = TripController.getTripTypeFromDate(dateRange);

    if (type === "recent") {
      throw new ApolloError("Can't create a poll after the trip is done");
    }

    if (options) {
      options = options.map((option) => {
        const id = uuidv4();
        return {
          ...option,
          creatorId: userId,
          id,
        };
      });
    }

    const poll = new Poll({
      creatorId: userId,
      title,
      description,
      tripId,
      options,
    });

    const { _id } = await poll.save();

    await Trip.findByIdAndUpdate(tripId, {
      $push: { polls: _id.toString() },
    });
    return {
      id: _id,
      options,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
