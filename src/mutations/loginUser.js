import { ApolloError, AuthenticationError } from "apollo-server-express";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import dotenv from "dotenv";
dotenv.config();

export const loginUser = async (_, { user }, { appToken }) => {
  if (!appToken || appToken !== process.env.APP_TOKEN) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { phoneNumber, googleIdToken, appleIdToken } = user;
    
    if (appleIdToken) {
      const { header: { kid }, payload: { sub: appleId } } = jwt.decode(appleIdToken, { complete: true });
      
      const res = await fetch('https://appleid.apple.com/auth/keys');

      if (res.status !== 200) {
        throw new ApolloError("Something went wrong");
      }

      const { keys } = await res.json();

      if (keys.findIndex(({ kid: k }) => k === kid) === -1) {
        throw new ApolloError("Invalid request");
      } 

      const _user = await User.findOne({ appleId });
      if (!_user) {
        throw new ApolloError("No user found, you need to sign up first");
      }

      const accessToken = jwt.sign({ userId: _user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return accessToken;
    }

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
