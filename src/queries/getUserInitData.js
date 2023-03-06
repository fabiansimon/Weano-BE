import { ApolloError, AuthenticationError } from "apollo-server-express";
import TripController from "../controllers/TripController.js";
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

    let countriesVisited = [];
    let friends = [];
    let tripData = await Promise.all(
      trips.map(async (trip) => {
        const { dateRange, _id, location: { placeName }, activeMembers } = trip;
        const placeNameArr = placeName.split(',');
        const country = placeNameArr[placeNameArr.length-1].trim();

        const cIndex = countriesVisited.findIndex((c) => c === country)

        for (const member of activeMembers) {
          const i = friends.findIndex((f) => f === member)
          if (i < 0) {
            friends.push(member);
          }
        }

        if (cIndex < 0) {
          countriesVisited.push(country);
        }

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

    return {
      userData: {
        ...userData,
        countriesVisited: countriesVisited.length,
        friendsAmount: friends.length-1
      },
      trips: tripData,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
