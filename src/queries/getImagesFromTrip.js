import { ApolloError, AuthenticationError } from "apollo-server-express";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import {
  daySegments,
  DAILY_IMAGE_CAP,
  IMAGES_PER_CHUNK,
} from "../utils/PushNotificationService.js";

export const getImagesFromTrip = async (_, { tripId }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const {
      images: tripImages,
      dateRange,
      activeMembers,
    } = await Trip.findById(tripId);

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

    const now = new Date() / 1000;
    const tripLength = Math.abs((dateRange.startDate - now) / 86400).toFixed(0);

    let totalImages = tripLength * DAILY_IMAGE_CAP;

    const currHour = new Date().getHours();
    for (var i = 0; i < daySegments.length; i++) {
      const { end } = daySegments[i];
      if (end > currHour) break;
      else {
        totalImages += parseInt(IMAGES_PER_CHUNK);
      }
    }

    const imagesToAdd = (totalImages / activeMembers.length).toFixed(0);

    images = images.map((image) => {
      return {
        ...image._doc,
        author: authors.filter((author) => author._id == image.author)[0],
      };
    });

    return {
      images,
      userFreeImages: imagesToAdd,
    };
  } catch (error) {
    throw new ApolloError(error);
  }
};
