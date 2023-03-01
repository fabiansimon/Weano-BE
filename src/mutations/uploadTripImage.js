import { ApolloError, AuthenticationError } from "apollo-server-express";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";

export const uploadTripImage = async (_, { image }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, description, uri, tripId } = image;

    const _image = new Image({
      title,
      description,
      uri,
      author: userId,
      tripId,
    });
    await User.findByIdAndUpdate(userId, { $push: { images: _image.id } });
    await Trip.findByIdAndUpdate(tripId, { $push: { images: _image.id } });

    await _image.save();
    return _image;
  } catch (error) {
    throw new ApolloError(error);
  }
};
