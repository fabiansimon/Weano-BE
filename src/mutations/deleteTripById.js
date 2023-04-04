import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const deleteTripById = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const trip = await Trip.findById(tripId);

    const {
      _id,
      // mutualTasks,
      // privateTasks,
      // destinationPoll,
      // polls: otherPolls,
      activeMembers,
    } = trip;

    // const tasks = mutualTasks.concat(privateTasks);

    // let polls;
    // if (destinationPoll) {
    //   polls = otherPolls.concat(destinationPoll);
    // }

    // await Task.deleteMany({ _id: { $in: tasks } });
    // await Poll.deleteMany({ _id: { $in: polls } });

    await activeMembers.forEach(async (member) => {
      await User.findByIdAndUpdate(member, {
        $pull: { trips: _id.toString() },
      });
      await Trip.findByIdAndUpdate(member, {
        $pull: { activeMembers: member },
      });
    });

    // await Trip.findByIdAndDelete(tripId);

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
