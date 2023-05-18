import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { sendPushNotifications } from "./src/utils/pushNotificationService.js";
import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { logError, logInfo } from "./src/utils/logger.js";
import config from 'config';
import fs from 'fs';
import http from "http";
import https from "https";

dotenv.config();

const ENVIRONMENT = config.get('database')
const PORT = ENVIRONMENT === 'production' ? process.env.PROD_PORT : process.env.DEV_PORT;

const startServer = async () => {
  // Create new ApolloServer with imported typeDefs and resolvers
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: ENVIRONMENT === 'production' ? [ApolloServerPluginLandingPageDisabled()] : [],

    // Check if request was authorized
    context: ({ req }) => {
      const token = req.headers.authorization || "";
      const appToken = req.headers['app-token'] || "";

      if (token === "") {
        return {
          userId: null,
          appToken: appToken
        };
      }

      try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        return {
          userId: data,
          appToken,
        };
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
    dbName: ENVIRONMENT,
  });

  console.log("Mongoose conntected");

  const twilioClient = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  app.get("/verify/:to", async (req, res) => {
    const { to } = req.params;
    const appToken = req.headers["app-token"];

    if (!appToken || appToken !== process.env.APP_TOKEN) {
      logError("Unauthorized call: " + JSON.stringify(req.headers));
      return res.sendStatus(401);
    }

    try {
      twilioClient.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verifications.create({ to, channel: "sms" })
        .then((verification) => {
          res.json(verification);
          logInfo("Verification sent out to: " + to);
        })
        .catch((err) => {
          logError("ERROR: " + err);
          res.json(err);
        });
    } catch (error) {
      logInfo("ERROR: " + error);
      return res.json(error);
    }
  });

  app.get("/check/:to/:code", async (req, res) => {
    const { to, code } = req.params;
    const appToken = req.headers["app-token"];

    if (!appToken || appToken !== process.env.APP_TOKEN) {
      logError("Unauthorized call: " + JSON.stringify(req.headers));
      return res.sendStatus(401);
    }

    try {
      twilioClient.verify
        .services(process.env.TWILIO_SERVICE_ID)
        .verificationChecks.create({ to, code })
        .then((verification) => {
          res.json(verification);
          logInfo("Verification check sent by: " + to);
        })
        .catch((err) => {
          logError("ERROR: " + err);
          res.json(err);
        });
    } catch (error) {
      logInfo("ERROR: " + error);
      res.json(error);
    }
  });

  app.get("/redirect/:operation/:tripId", async (req, res) => {
    const { operation, tripId } = req.params;

    try {
      return res.send(
        `<script>
          window.location="weano://${operation}/${tripId}";
          setTimeout("window.location = 'https://apps.apple.com/us/app/weano/id1630415197';", 4000);
        </script>`
      );
    } catch (error) {
      res.json(error);
    }
  });

  app.get("/invite/:receivers/:tripId", async (req, res) => {
    const { receivers, tripId } = req.params;
    const appToken = req.headers["app-token"];

    if (!appToken || appToken !== process.env.APP_TOKEN) {
      logError("Unauthorized call: " + JSON.stringify(req.headers));
      return res.sendStatus(401);
    }

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
      html: `<p>Hey! You've been invited to join a trip! Click the link below to join!</p><a href="https://weano.app/redirect/invitation/${tripId}"> JOIN TRIP </a>`,
    };

    try {
      transporter.sendMail(options, function (err, info) {
        if (err) {
          return res.json(err);
        }
        logInfo("Invitation email sent to: " + formattedReceivers);
        return res.json("Email sent: " + info.response);
      });
    } catch (error) {
      logError("ERROR: " + err);
      res.json(error);
    }
  });

  planPushNotificationServer();

  // app.listen(PORT, () =>
  //   console.log(
  //     `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  //   )
  // );

  // const httpsServer = https.createServer({
  //   key: fs.readFileSync("key.pem"),
  //   cert: fs.readFileSync("cert.pem"),
  // }, app);

  // httpsServer.listen(443);

  const httpServer = http.createServer(app);
  httpServer.listen(PORT);
};

const planPushNotificationServer = () => {
  sendPushNotifications();

  const now = new Date();
  const midnight = new Date(now).setHours(0, 0, 0, 0);

  const difference = Math.abs(midnight - now);
  const delay = 24 * 1000 * 60 * 60 - difference;

  logInfo(
    `Until Push Notifications will be updated: ${delay / 1000 / 60 / 60} Hours`
  );

  setTimeout(() => {
    planPushNotificationServer();
  }, delay);
};

startServer();
