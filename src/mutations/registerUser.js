import { ApolloError, ValidationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const registerUser = async (_, { user }) => {
  try {
    const { phoneNumber, email, firstName, lastName } = user;

    const res = await User.find({ $or: [{ phoneNumber }, { email }] });

    if (res.length) {
      throw new ValidationError("Already a user");
    }

    const _user = new User({ phoneNumber, email, firstName, lastName });

    await _user.save();

    const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return accessToken;
  } catch (error) {
    throw new ApolloError(error);
  }
};
