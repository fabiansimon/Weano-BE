import { ApolloError, AuthenticationError } from "apollo-server-express";
import TripController from "../controllers/TripController.js";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const getImagesFromTrip = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { images: tripImages, dateRange } = await Trip.findById(tripId);

    let images = await Image.find({
      _id: {
        $in: tripImages,
      },
    });

    const authorsArr = images.map((image) => image.author);

    const authors = await User.find({
      _id: {
        $in: authorsArr,
      },
    });

    const type = TripController.getTripTypeFromDate(dateRange);

    let userFreeImages = 0;
    if (type === "active") {
      userFreeImages = await TripController.getFreeImagesForUser(
        tripId,
        userId
      );
    }

    images = images.map((image) => {
      return {
        ...image._doc,
        author: authors.filter((author) => author._id == image.author)[0],
      };
    });

    return {
      images,
      userFreeImages,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
