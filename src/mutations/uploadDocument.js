import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import Document from "../models/Document.model.js";

export const uploadDocument = async (_, { document }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { uri, type, title, tripId } = document;

    const _document = new Document({
      uri,
      creatorId: userId,
      tripId,
      title,
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
