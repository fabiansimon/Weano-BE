import dotenv from "dotenv";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";
import { logError, logInfo } from "./logger.js";
dotenv.config();

export const daySegments = [
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
    end: 23,
  },
];

const GOAL_IMAGES_TOTAL = 30;
const DEBUG_DATE = new Date();
DEBUG_DATE.setSeconds(DEBUG_DATE.getSeconds() + 15);
DEBUG_DATE.setHours(DEBUG_DATE.getHours() + 1);

const DEBUG_HOST_ID = "64036361669968d42b8e3840";

const DEBUG_ON = false;

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

    const tripTimeChunks = filterTimeChunks(trip, timeChunks);

    for (var i = 0; i < tripTimeChunks.length; i++) {
      const member = members[i % members.length];

      const { token, firstName, id } = member;
      const { id: tripId } = trip;

      if (!token) {
        continue;
      }

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
        pushTime: tripTimeChunks[i],
        userId: id,
      });
    }
  }

  for (var i = 0; i < timeChunks.length; i++) {
    const messagesChunk = messages.filter(
      (message) => message.pushTime === timeChunks[i]
    );

    if (messagesChunk.length <= 0) {
      continue;
    }

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

async function scheduleNotification(chunk, time, expo) {
  let now = new Date();
  now.setHours(now.getHours() + 1);
  let filteredChunk;
  const delay = Math.abs(time - now);

  logInfo("Push notifications will be send out: " + time);

  setTimeout(async () => {
    filteredChunk = await getActiveChunkItems(chunk);

    if (filteredChunk.length <= 0) {
      return;
    }

    updateAssignedImages(filteredChunk);
    expo.sendPushNotificationsAsync(filteredChunk);
    logInfo(
      "Current chunk sent out to " + filteredChunk.length + "users --" + time
    );
  }, delay);
}

async function getActiveChunkItems(chunk) {
  const Trips = db.model("trip");
  const arr = [];
  const now = (Date.now() / 1000).toFixed(0);
  for (const item of chunk) {
    const {
      hostId,
      dateRange: { startDate, endDate },
      activeMembers,
    } = await Trips.findById(item.data.tripId);

    if (startDate < now && endDate > now && activeMembers.length > 0) {
      if (!DEBUG_ON) {
        arr.push(item);
      }

      if (DEBUG_ON && hostId === DEBUG_HOST_ID) {
        arr.push(item);
      }
    }
  }

  return arr;
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
    activeMembers: { $exists: true, $not: { $size: 0 } },
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
  const perChunks = GOAL_IMAGES_TOTAL / daySegments.length;

  for (const segment of daySegments) {
    for (var i = 0; i < perChunks; i++) {
      const { start, end } = segment;
      const hour = Math.round(Math.random() * (end - start) + start);
      const minute = Math.round(Math.random() * 60);
      const date = new Date();
      date.setHours(hour, minute);
      chunks.push(date);
    }
  }

  if (DEBUG_ON) {
    chunks[0] = DEBUG_DATE;
  }

  return chunks;
}

function filterTimeChunks(trip, timeChunks) {
  let filteredChunks = [];
  const {
    dateRange: { startDate, endDate },
    activeMembers,
  } = trip;

  const diff = (Math.abs(endDate - startDate) / 60 / 60 / 24).toFixed(0);
  let dailyImages = GOAL_IMAGES_TOTAL / diff;
  let imagesPerUser = Math.round(dailyImages / activeMembers.length);

  if (dailyImages < 1) dailyImages = 1;
  if (dailyImages > 10) dailyImages = 10;
  if (imagesPerUser > 3) dailyImages = activeMembers.length * 3;

  while (filteredChunks.length < dailyImages) {
    const chunk = timeChunks[Math.floor(Math.random() * timeChunks.length)];
    if (filteredChunks.findIndex((c) => chunk === c) === -1) {
      filteredChunks.push(chunk);
    }
  }

  if (DEBUG_ON) {
    filteredChunks[0] = DEBUG_DATE;
  }

  return filteredChunks;
}
