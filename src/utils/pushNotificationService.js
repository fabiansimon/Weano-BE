import dotenv from "dotenv";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";
import { logError, logInfo } from "./logger.js";
dotenv.config();

const daySegments = [
  {
    start: 8,
    end: 11,
  },
  {
    start: 11,
    end: 14,
  },
  {
    start: 14,
    end: 17,
  },
  {
    start: 17,
    end: 20,
  },
  {
    start: 20,
    end: 24,
  },
];

const DAILY_IMAGE_CAP = 10;
const IMAGES_PER_CHUNK = (DAILY_IMAGE_CAP / daySegments.length).toFixed(0);
const db = mongoose.connection;

export async function sendPushNotifications() {
  let expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
  const activeTrips = await getActiveTrips();
  const timeChunks = getTimeChunks();

  let messages = [];
  for (const trip of activeTrips) {
    const { activeMembers } = trip;
    const members = await getPushTokens(activeMembers);

    for (var i = 0; i < timeChunks.length; i++) {
      const member = members[i % members.length];
      const { token, firstName } = member;
      const { id: tripId } = trip;
      if (!Expo.isExpoPushToken(token)) {
        logError(`Push token ${token} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        title: `Hey ${firstName}, it's time ⏰`,
        body: "Let's capture the moment, it only takes a second 📸",
        data: {
          upload_reminder_id: tripId,
        },
        pushTime: timeChunks[i],
      });
    }
  }

  for (var i = 0; i < timeChunks.length; i++) {
    const messagesChunk = messages.filter(
      (message) => message.pushTime === timeChunks[i]
    );

    let chunks = expo.chunkPushNotifications(messagesChunk);

    for (let chunk of chunks) {
      const chunkTime = new Date(chunk[0].pushTime);
      const now = new Date();

      try {
        if (now < chunkTime) {
          scheduleNotification(chunk, timeChunks[i], expo);
        }
      } catch (error) {
        logError(error);
      }
    }
  }
}

const scheduleNotification = (chunk, time, expo) => {
  const now = new Date();
  const delay = Math.abs(time - now);

  logInfo("Push notifications will be send out: " + time);

  setTimeout(() => {
    expo.sendPushNotificationsAsync(chunk);
    logInfo("CURRENT CHUNK SENT OUT: " + chunk);
  }, delay);
};

async function getActiveTrips() {
  const Trips = db.model("trip");

  const now = (Date.now() / 1000).toFixed(0);

  const activeTrips = await Trips.find({
    "dateRange.startDate": { $lt: now },
    "dateRange.endDate": { $gt: now },
  });
  return activeTrips;
}

async function getPushTokens(users) {
  const User = db.model("user");

  const usersData = await User.find({
    _id: {
      $in: users,
    },
  });

  const pushToken = usersData.map((user) => {
    return {
      token: user.pushToken,
      firstName: user.firstName,
    };
  });
  return pushToken;
}

function getTimeChunks() {
  const chunks = [];

  for (const segment of daySegments) {
    for (var i = 0; i < IMAGES_PER_CHUNK; i++) {
      const { start, end } = segment;
      const hour = Math.floor(Math.random() * (end - start) + start);
      const minute = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setHours(hour, minute);
      chunks.push(date);
    }
  }
  chunks[0] = new Date("2023-01-17T16:12:06.976Z");
  return chunks;
}
