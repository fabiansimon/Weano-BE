import { ApolloError } from "apollo-server-express";
import Trip from "../models/Trip.model.js";

export const getTrips = async () => {
  
  try {
    return await Trip.find();
  } catch (error) {
    throw new ApolloError(error);
  }
};
