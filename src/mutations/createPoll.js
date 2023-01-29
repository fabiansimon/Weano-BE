import { ApolloError, AuthenticationError } from "apollo-server-express";
import { v4 as uuidv4 } from "uuid";
import Poll from "../models/Poll.model.js";
import Trip from "../models/Trip.model.js";

export const createPoll = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { title, description, tripId, options } = args.poll;

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
    return _id;
  } catch (error) {
    throw new ApolloError(error);
  }
};
