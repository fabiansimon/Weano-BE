import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import twilio from "twilio";
dotenv.config();

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
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
  const app = express();

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
    const to = req.params.to;

    twilioClient.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verifications.create({ to, channel: "sms" })
      .then((verification) => {
        res.json(verification);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  app.get("/check/:to/:code", async (req, res) => {
    const to = req.params.to;
    const code = req.params.code;
    twilioClient.verify
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to, code })
      .then((verification) => {
        res.json(verification);
      })
      .catch((err) => {
        res.json(err);
      });
  });

  app.listen(process.env.PORT, () =>
    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
    )
  );
};

startServer();
