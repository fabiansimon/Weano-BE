import { ApolloError, AuthenticationError } from "apollo-server-express";
import Image from "../models/Image.model.js";
import Task from "../models/Task.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const getUserInitData = async (_, __, { userId }) => {
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

    const now = Date.now() / 1000;
    let recapTimestamp = new Date();
    recapTimestamp.setFullYear(recapTimestamp.getFullYear() - 1);
    recapTimestamp = Date.parse(recapTimestamp) / 1000;

    const tripData = await Promise.all(
      trips.map(async (trip) => {
        const { dateRange } = trip;
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

        // const isActive =
        //   dateRange.startDate < now && dateRange.endDate > now;
        // const isRewind =
        //   dateRange.startDate < recapTimestamp && dateRange.endDate < now;
        const isUpcoming = ((dateRange.startDate - now) / 86400).toFixed(0) < 7;

        if (isUpcoming) {
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
        return trip;
      })
    );

    const images = await Image.find({
      _id: {
        $in: userData.images,
      },
    });

    return {
      userData,
      trips: tripData,
      images,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
