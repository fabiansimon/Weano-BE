import { ApolloError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const loginUser = async (_, { user }, { res }) => {
  try {
    const { phoneNumber, email } = user;

    let _user;
    if (phoneNumber) {
      _user = await User.findOne({ phoneNumber });
    } else {
      _user = await User.findOne({ email });
    }

    if (!_user) {
      throw new ApolloError("No user found");
    }

    const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return accessToken;
  } catch (error) {
    throw new ApolloError(error);
  }
};
