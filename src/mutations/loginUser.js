import { ApolloError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const loginUser = async (_, { user }, { res }) => {
  try {
    const { phoneNumber, googleIdToken } = user;

    if (googleIdToken) {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`);

      if (res.status !== 200) {
        throw new ApolloError("Something went wrong");
      }

      const { sub: googleId } = await res.json();

      const _user = await User.findOne({ googleId });
      if (!_user) {
        throw new ApolloError("No user found");
      }

      const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return accessToken;
    }

    const _user = await User.findOne({ phoneNumber });

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
