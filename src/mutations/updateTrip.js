import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";

export const updateTrip = async (_, { trip }, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const {
      tripId,
      thumbnailUri,
      title,
      description,
      destinations,
      activeMembers,
      dateRange,
      images,
      expenses,
      currency,
    } = trip;

    const updates = {};

    if (thumbnailUri !== undefined) {
      updates.thumbnailUri = thumbnailUri;
    }
    if (title !== undefined) {
      updates.title = title;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (destinations !== undefined) {
      updates.destinations = destinations;
    }

    if (currency !== undefined) {
      updates.currency = currency;
    }

    if (activeMembers !== undefined) {
      updates.activeMembers = activeMembers;
    }
    if (dateRange !== undefined) {
      updates.dateRange = dateRange;
    }
    if (images !== undefined) {
      updates.images = images;
    }
    if (expenses !== undefined) {
      updates.expenses = expenses;
    }

    await Trip.findByIdAndUpdate(tripId, updates, { new: true });
    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
