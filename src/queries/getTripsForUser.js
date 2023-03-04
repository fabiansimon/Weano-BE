import { ApolloError, AuthenticationError } from "apollo-server-express";
import TripController from "../controllers/TripController.js";
import Image from "../models/Image.model.js";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const getTripsForUser = async (_, __, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }
  try {
    const userData = await User.findById(userId);

    const trips = await Trip.find({
      _id: {
        $in: userData.trips,
      },
    });

    let tripData = await Promise.all(
      trips.map(async (trip) => {
        const { dateRange, _id } = trip;
        let _images = await Image.find({
          _id: {
            $in: trip.images,
          },
        });
        let _activeMembers = await User.find({
          _id: {
            $in: trip.activeMembers,
          },
        });

        const type = TripController.getTripTypeFromDate(dateRange);

        let userFreeImages;
        if (type === "active") {
          userFreeImages = await TripController.getFreeImagesForUser(
            _id.toString(),
            userId
          );
        } else {
          userFreeImages = 0;
        }

        if (type === "soon") {
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

          trip.openTasks = [...mutualTasks, ...privateTasks];
        }

        trip.images = _images;
        trip.activeMembers = _activeMembers;
        trip.type = type;
        trip.userFreeImages = userFreeImages;
        return trip;
      })
    );

    tripData.sort((a, b) => {
      if (b?.dateRange?.startDate > a?.dateRange?.startDate) {
        return -1;
      }
      return 0;
    });

    return tripData;
  } catch (error) {
    throw new ApolloError(error);
  }
};
