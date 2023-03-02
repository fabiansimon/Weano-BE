import { ApolloError, AuthenticationError } from "apollo-server-express";
import Image from "../models/Image.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import Document from "../models/Document.model.js";

export const uploadDocument = async (_, { document }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { uri, type, tripId } = document;

    const _document = new Document({
      uri,
      creatorId: userId,
      tripId,
      type,
    });

    await Trip.findByIdAndUpdate(tripId, {
      $push: { documents: _document.id },
    });

    const documentData = await _document.save();
    return documentData;
  } catch (error) {
    throw new ApolloError(error);
  }
};
