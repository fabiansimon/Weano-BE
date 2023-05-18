import { ApolloError, AuthenticationError } from "apollo-server-express";
import TripController from "../controllers/TripController.js";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const uploadTripImage = async (_, { image }, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, description, uri, tripId, s3Key } = image;

    const { dateRange } = await Trip.findById(tripId);

    const type = TripController.getTripTypeFromDate(dateRange);

    if (type !== "active") {
      throw new ApolloError("Trip is not active at the moment");
    }

    const userFreeImages = await TripController.getFreeImagesForUser(
      tripId,
      userId
    );

    if (userFreeImages <= 0) {
      throw new ApolloError("No free images left right now.");
    }

    const _image = new Image({
      title,
      description,
      uri,
      author: userId,
      tripId,
      s3Key: s3Key || '',
    });

    const {
      _id: authorId,
      firstName,
      lastName,
      avatarUri,
    } = await User.findByIdAndUpdate(userId, {
      $push: { images: _image.id },
    });
    await Trip.findByIdAndUpdate(tripId, { $push: { images: _image.id } });

    const {
      _id,
      createdAt: _createdAt,
      uri: _uri,
      title: _title,
      description: _description,
    } = await _image.save();

    const tripImage = {
      _id,
      createdAt: _createdAt,
      uri: _uri,
      title: _title,
      description: _description,
      author: {
        _id: authorId,
        firstName,
        lastName,
        avatarUri,
      },
      userFreeImages,
    };

    return tripImage;
  } catch (error) {
    throw new ApolloError(error);
  }
};
