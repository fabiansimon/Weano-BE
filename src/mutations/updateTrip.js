import { ApolloError, AuthenticationError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";
import TripController from "../controllers/TripController.js";

export const updateTrip = async (_, { trip }, { userId: {userId} }) => {
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
      newHost,
      chatRoomId,
    } = trip;

    const { hostIds, activeMembers: members } = await Trip.findById(tripId)
    
    if (!members?.includes(userId)) {
      throw new AuthenticationError("Not part of this trip");
    }

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
    if (newHost !== undefined) {
      if (!hostIds.includes(newHost)) {
        updates.hostIds = [...hostIds, newHost];
      }
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
    if (chatRoomId !== undefined) {
      updates.chatRoomId = chatRoomId;
    }

    await Trip.findByIdAndUpdate(tripId, updates, { new: true });
    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
