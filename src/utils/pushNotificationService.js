import dotenv from "dotenv";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";
import { logError, logInfo } from "./logger.js";
dotenv.config();

export const daySegments = [
  // {
  //   start: 11,
  //   end: 14,
  // },
  {
    start: 11,
    end: 15,
  },
  {
    start: 15,
    end: 19,
  },
  {
    start: 19,
    end: 24,
  },
];

export const DAILY_IMAGE_CAP = 6;
export const IMAGES_PER_CHUNK = (DAILY_IMAGE_CAP / daySegments.length).toFixed(
  0
);
const db = mongoose.connection;

export async function sendPushNotifications() {
  let expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
  const activeTrips = await getActiveTrips();

  if (activeTrips.length <= 0) {
    logInfo("No Active trips");
    return;
  }
  const timeChunks = getTimeChunks();

  let messages = [];
  for (const trip of activeTrips) {
    const { activeMembers } = trip;
    let members = await getPushTokens(activeMembers);
    members = shuffleMembers(members);

    for (var i = 0; i < timeChunks.length; i++) {
      const member = members[i % members.length];

      const { token, firstName, id } = member;
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
          type: "upload_reminder",
          tripId: tripId,
        },
        pushTime: timeChunks[i],
        userId: id,
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

function shuffleMembers(members) {
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = members[i];
    members[i] = members[j];
    members[j] = temp;
  }
  return members;
}

function scheduleNotification(chunk, time, expo) {
  const now = new Date();
  const delay = Math.abs(time - now);

  logInfo("Push notifications will be send out: " + time);

  setTimeout(() => {
    updateAssignedImages(chunk);
    expo.sendPushNotificationsAsync(chunk);
    logInfo("Current chunk sent out: " + time);
  }, delay);
}

async function updateAssignedImages(chunk) {
  const Trips = db.model("trip");

  for (const item of chunk) {
    const { tripId } = item.data;
    const { userId } = item;

    await Trips.findByIdAndUpdate(tripId, {
      $push: { assignedImages: userId },
    });
  }
}

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
      id: user.id,
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
  // const debugDate = new Date();
  // debugDate.setSeconds(debugDate.getSeconds() + 2);
  // chunks[0] = debugDate;
  return chunks;
}
