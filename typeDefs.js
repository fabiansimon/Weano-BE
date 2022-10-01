import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Post {
    id: ID
    title: String
    description: String
  }

  type Trip {
    id: ID
    title: String
    location: String
    invitees: [String]!
    startDate: Int
    endDate: Int
  }

  type Query {
    hello: String
    getAllTrips: [Trip]
    getPost(id: ID): Post
  }

  input PostInput {
    title: String
    description: String
  }

  input TripInput {
    title: String
    location: String
    invitees: [String]!
    startDate: Int
    endDate: Int
  }

  type Mutation {
    createTrip(trip: TripInput): Trip
    createPost(post: PostInput): Post
    deleteTrip(id: ID): String
    deleteAllTrips: String
    updatePost(id: ID, post: PostInput): Post
  }
`;

export default typeDefs;
