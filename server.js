import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { Expo } from "expo-server-sdk";

dotenv.config();

const startServer = async () => {
  // Create new ApolloServer with imported typeDefs and resolvers
  const server = new ApolloServer({
    typeDefs,
    resolvers,

    // Check if request was authorized
    context: ({ req }) => {
      const token = req.headers.authorization || "";

      if (token === "") {
        return null;
      }

      try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        return data;
      } catch (error) {
        throw new AuthenticationError(error);
      }
    },
  });

  // create App instance
  const app = express();

  // Start Server
  await server.start();
  app.get("/", async (_, res) => {
    res.send("🚀🚀🚀");
  });

  server.applyMiddleware({ app });

  const db = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@traveliocluster.slwo6yz.mongodb.net/?retryWrites=true&w=majority`;

  mongoose.connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  console.log("Mongoose conntected");

  const twilioClient = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  app.get("/verify/:to", async (req, res) => {
    const { to } = req.params;

    try {
      twilioClient.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({ to, channel: "sms" })
        .then((verification) => {
          res.json(verification);
        })
        .catch((err) => {
          res.json(err);
        });
    } catch (error) {
      res.json(error);
    }
  });

  app.get("/check/:to/:code", async (req, res) => {
    const { to, code } = req.params;

    try {
      twilioClient.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({ to, code })
        .then((verification) => {
          res.json(verification);
        })
        .catch((err) => {
          res.json(err);
        });
    } catch (error) {
      res.json(error);
    }
  });

  app.get("/redirect/:operation/:tripId", async (req, res) => {
    const { operation, tripId } = req.params;

    try {
      return res.send(
        `<script>
          window.location="weano://${operation}/${tripId}";
          setTimeout("window.location = 'https://apps.apple.com/us/app/keynote/id361285480';", 2000);
        </script>`
      );
    } catch (error) {
      res.json(error);
    }
  });

  app.get("/invite/:receivers/:tripId", async (req, res) => {
    const { receivers, tripId } = req.params;
    const formattedReceivers = receivers.split("&").toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const options = {
      from: "Weano",
      to: formattedReceivers,
      subject: "Weano Invitation Link",
      html: `<p>Hey! You've been invited to join a trip! Click the link below to join!</p><a href="http://143.198.241.91:4000/redirect/invitation/${tripId}"> JOIN TRIP </a>`,
    };

    try {
      transporter.sendMail(options, function (err, info) {
        if (err) {
          return res.json(err);
        }
        return res.json("Email sent: " + info.response);
      });
    } catch (error) {
      res.json(error);
    }
  });

  const sendPushnotifications = async () => {
    let expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
    const tokens = ["ExponentPushToken[Uvo1J8JoGOZi6oVfGLwHAA]"];

    let messages = [];
    for (let token of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        titlte: "Hey, it's time ⏰",
        body: "Let's capture the moment, it only takes a second 📸",
        data: {
          upload_reminder_id: "63b322defdddac84ce420429",
        },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(error);
      }
    }
  };

  app.listen(process.env.PORT, () =>
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
    )
  );

  setTimeout(() => {
    sendPushnotifications();
  }, 3000);
};

startServer();
