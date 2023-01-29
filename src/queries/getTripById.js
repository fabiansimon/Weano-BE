import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import Poll from "../models/Poll.model.js";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import Image from "../models/Image.model.js";

export const getTripById = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const trip = await Trip.findById(tripId);
    const images = await Image.find({
      _id: {
        $in: trip.images,
      },
    });

    const expenses = await Expense.find({
      _id: {
        $in: trip.expenses,
      },
    });

    const activeMembers = await User.find({
      _id: {
        $in: trip.activeMembers,
      },
    });

    const polls = await Poll.find({
      _id: {
        $in: trip.polls,
      },
    });

    const mutualTasks = await Task.find({
      _id: {
        $in: trip.mutualTasks,
      },
    });

    const privateTasks = await Task.find({
      _id: {
        $in: trip.privateTasks,
      },
    })
      .where("creatorId")
      .equals(userId);

    const {
      _id: id,
      hostId,
      thumbnailUri,
      title,
      description,
      location,
      dateRange,
    } = trip;

    return {
      id,
      hostId,
      thumbnailUri,
      title,
      description,
      location,
      dateRange,
      activeMembers,
      expenses,
      images,
      polls,
      mutualTasks,
      privateTasks,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
