import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import Document from "../models/Document.model.js";
import TripController from "../controllers/TripController.js";

export const uploadDocument = async (_, { document }, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { uri, type, title, tripId } = document;

    const { dateRange } = await Trip.findById(tripId);

    const tripType = TripController.getTripTypeFromDate(dateRange);

    if (tripType === "recent") {
      throw new ApolloError("Can't add a document after the trip is done");
    }

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
