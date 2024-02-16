import { ApolloError, AuthenticationError } from "apollo-server-express";
import PackingItem from "../models/PackingItem.model.js";

export const updatePackingItem = async (_, args, { userId: {userId} }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    let { id, isPacked, amount } = args.data;

    const updates = {};

    updates.isPacked = isPacked;

    if (amount !== undefined) {
      updates.amount = amount;
    }

    const packingItem = await PackingItem.findByIdAndUpdate(id, updates);

    if (!packingItem) {
      throw new ApolloError("No Packing Item found with that ID");
    }

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
