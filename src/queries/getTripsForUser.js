import { ApolloError, AuthenticationError } from "apollo-server-express";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const getTripsForUser = async (_, __, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }
  try {
    const userData = await User.findById(userId);

    const tripData = await Trip.find({
      _id: {
        $in: userData.trips,
      },
    });

    const trips = await Promise.all(
      tripData.map(async (trip) => {
        let _images = await Image.find({
          _id: {
            $in: trip.images,
          },
        });

        trip.images = _images;
        return trip;
      })
    );

    return trips;
  } catch (error) {
    throw new ApolloError(error);
  }
};
