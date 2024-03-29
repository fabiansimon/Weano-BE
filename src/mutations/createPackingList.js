import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import PackingItem from "../models/PackingItem.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import TripController from "../controllers/TripController.js";

export const createPackingList = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { items, tripId } = args.packingData;

    const { dateRange } = await Trip.findById(tripId);

    const type = TripController.getTripTypeFromDate(dateRange);

    if (type === "recent") {
      throw new ApolloError("Can't create a packinglist item after the trip is done");
    }


    let newItems = [];
    for (const item of items) {
      const { title } = item;
      const packingItem = await new PackingItem({
        creatorId: userId,
        title,
        amount: item.amount || 1,
        isPacked: false,
      }).save();
      newItems.push(packingItem);
    }

    const newIds = newItems.map((item) => item._id.toString());

    await Trip.findByIdAndUpdate(tripId, {
      $push: { packingItems: { $each: newIds } },
    });

    return newItems;
  } catch (error) {
    throw new ApolloError(error);
  }
};
