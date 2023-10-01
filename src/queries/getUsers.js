import { ApolloError } from "apollo-server-express";
import User from "../models/User.model.js";

export const getUsers = async () => {
  
  try {
    return await User.find();
  } catch (error) {
    throw new ApolloError(error);
  }
};
