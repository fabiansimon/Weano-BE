import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";
import Trip from "../models/Trip.model.js";

export const deleteExpense = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { id, tripId } = args.data;

    try {
      await Expense.findByIdAndDelete(id);
      await Trip.findByIdAndUpdate(tripId, {
        $pull: { expenses: id },
      });

      return true;
    } catch (error) {
      throw new ApolloError(error);
    }
  } catch (error) {
    throw new ApolloError(error);
  }
};
