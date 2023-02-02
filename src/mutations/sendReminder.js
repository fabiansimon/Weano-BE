import { ApolloError, AuthenticationError } from "apollo-server-express";
import dotenv from "dotenv";
import { Expo } from "expo-server-sdk";
import User from "../models/User.model.js";
import { logError, logInfo } from "../utils/logger.js";
dotenv.config();

let expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
export const sendReminder = async (_, args, { userId }) => {
  if (!userId) {
    throw new AuthenticationError("Not authenticated");
  }

  try {
    const { receivers, title, description, type, tripId } = args.data;

    let users = await User.find({
      _id: {
        $in: receivers,
      },
    });

    const data = users.map((user) => {
      return {
        token: user.pushToken,
      };
    });

    let messages = [];
    for (var i = 0; i < data.length; i++) {
      const { token } = data[i];
      console.log(token);
      if (!Expo.isExpoPushToken(token)) {
        logError(`Push token ${token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        title,
        body: description,
        data: {
          type,
          tripId,
        },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      expo.sendPushNotificationsAsync(chunk);
      logInfo("Current reminder sent out: " + chunk);
    }

    return true;
  } catch (error) {
    throw new ApolloError(error);
  }
};
