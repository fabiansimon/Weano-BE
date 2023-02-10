import { ApolloError, AuthenticationError } from "apollo-server-express";
import { createLogger } from "winston";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import {
  daySegments,
  DAILY_IMAGE_CAP,
  IMAGES_PER_CHUNK,
} from "../utils/pushNotificationService.js";

export const getImagesFromTrip = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { images: tripImages, assignedImages } = await Trip.findById(tripId);

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

    let userFreeImages;

    const postedAmount = images.filter(
      (image) => image.author === userId
    ).length;
    const assignedAmount = assignedImages.filter((id) => id === userId).length;

    if (postedAmount > assignedAmount) {
      userFreeImages = 0;
    } else {
      userFreeImages = assignedAmount - postedAmount;
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
