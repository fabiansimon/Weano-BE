import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import TripController from "../controllers/TripController.js";

export const createExpense = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, amount, currency, tripId, paidBy } = args.expense;
    
    // const { dateRange } = await Trip.findById(tripId);

    // const type = TripController.getTripTypeFromDate(dateRange);

    // if (type === "recent") {
    //   throw new ApolloError("Can't create an expense after the trip is done");
    // }

    const expense = new Expense({
      creatorId: userId,
      title,
      amount,
      currency: currency || "$",
      paidBy: paidBy || userId
    });

    const { _id } = await expense.save();

    await Trip.findByIdAndUpdate(tripId, {
      $push: { expenses: _id.toString() },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        expenses: {
          expense: _id.toString(),
          trip: tripId,
        },
      },
    });
    return _id;
  } catch (error) {
    throw new ApolloError(error);
  }
};
