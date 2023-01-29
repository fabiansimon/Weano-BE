import { ApolloError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const loginUser = async (_, { user }, { res }) => {
  try {
    const { phoneNumber } = user;
    const _user = await User.findOne({ phoneNumber });

    if (!_user) {
      throw new ApolloError("No user with that phone number found");
    }

    const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return accessToken;
  } catch (error) {
    throw new ApolloError(error);
  }
};
