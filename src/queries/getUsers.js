import { ApolloError } from "apollo-server-express";
import User from "../models/User.model.js";

export const getUsers = async (_, __, { appToken }) => {
  if (!appToken || appToken !== process.env.APP_TOKEN) {
    throw new AuthenticationError("App Token missing");
  }
  
  try {
    return await User.find();
  } catch (error) {
    throw new ApolloError(error);
  }
};
