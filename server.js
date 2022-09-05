import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './typeDefs.js';
import resolvers from './resolvers.js';
import mongoose from 'mongoose';

const startServer = async () => {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  app.use((req, res) => {
    res.send('Hello from express apollo sever');
  });

  await mongoose.connect('mongodb://localhost:27017/post_db', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  console.log('Mongoose conntected');

  app.listen(4000, () => console.log('Server is running on PORT 4000'));
};

startServer();
