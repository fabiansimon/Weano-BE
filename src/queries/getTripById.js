import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import Poll from "../models/Poll.model.js";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import Image from "../models/Image.model.js";
import Document from "../models/Document.model.js";
import TripController from "../controllers/TripController.js";
import PackingItem from "../models/PackingItem.model.js";

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

    const packingItems = await PackingItem.find({
      _id: {
        $in: trip.packingItems,
      },
    })
      .where("creatorId")
      .equals(userId);

    const documents = await Document.find({
      _id: {
        $in: trip.documents,
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
      destinations,
      dateRange,
      currency,
    } = trip;

    const type = TripController.getTripTypeFromDate(dateRange);

    let userFreeImages;
    if (type === "active") {
      userFreeImages = await TripController.getFreeImagesForUser(
        tripId,
        userId
      );
    } else {
      userFreeImages = 0;
    }

    return {
      id,
      hostId,
      thumbnailUri,
      title,
      description,
      destinations,
      dateRange,
      activeMembers,
      expenses,
      images,
      polls,
      mutualTasks,
      privateTasks,
      documents,
      packingItems,
      type,
      userFreeImages,
      currency,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
