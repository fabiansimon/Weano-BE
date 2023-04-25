import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import TripController from "../controllers/TripController.js";

export const deleteTripById = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const trip = await Trip.findById(tripId);

    const isHost = await TripController.isUserHost(userId, tripId);

    if (!isHost) {
      throw new ApolloError("Must be host to proceed");
    }

    const {
      _id,
      // mutualTasks,
      // privateTasks,
      // destinationPoll,
      // polls: otherPolls,
      activeMembers,
    } = trip;

    if (activeMembers.length > 1) {
      throw new ApolloError("Can't delete the trip while there are other travelers active within the trip");
    }

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
    
      await Trip.findByIdAndUpdate(_id, {
        $pull: { activeMembers: member },
        deleted: true
      });
    });

    // await Trip.findByIdAndDelete(tripId);

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
