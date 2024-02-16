import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import Trip from "../models/Trip.model.js";
import User from "../models/User.model.js";
import TripController from "../controllers/TripController.js";

export const createExpense = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { title, amount, currency, tripId, paidBy, category, splitBy } = args.expense;

    if (args?.expense?.squashedExpenses) {
      const ids = args.expense.squashedExpenses;

      for (const id of ids) {
        await Expense.findByIdAndDelete(id);
      }
      
      await Trip.findByIdAndUpdate(tripId, {
        $pullAll: { expenses: ids },
      });
    }
    
    const expense = new Expense({
      creatorId: userId,
      title,
      amount: amount.toFixed(2),
      currency: currency || "$",
      paidBy: paidBy || userId,
      category: category || 'other',
      splitBy: splitBy || [],
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
