import { ApolloError, AuthenticationError } from "apollo-server-express";
import Expense from "../models/Expense.model.js";

export const updateExpense = async (_, { expense }, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

    try {
    const { title, amount, currency, paidBy, splitBy, category, id } = expense;

    const updates = {};

    if (title !== undefined) {
      updates.title = title;
    }
    if (amount !== undefined) {
      updates.amount = amount;
    }
    if (currency !== undefined) {
      updates.currency = currency;
    }
    if (paidBy !== undefined) {
      updates.paidBy = paidBy;
    }
    if (splitBy !== undefined) {
      updates.splitBy = splitBy;
    }
    if (category !== undefined) {
      updates.category = category;
    }

    await Expense.findByIdAndUpdate(id, updates, { new: true });
    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
