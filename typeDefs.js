import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Post {
    id: ID
    title: String
    description: String
  }

  type User {
    id: ID
    email: String
    firstName: String
    lastName: String
    images: [String]
    trips: [String]
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
    me: User
    getAllTrips: [Trip]
    getPost(id: ID): Post
    getAllUsers: [User]
    getUserById(id: ID): User
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

  input RegisterUserInput {
    phoneNumber: String!
    email: String!
    firstName: String!
    lastName: String!
  }

  input LoginUserInput {
    phoneNumber: String!
  }

  input ImageInput {
    uri: String!
    title: String
    description: String
  }

  type Mutation {
    registerUser(user: RegisterUserInput!): String!
    loginUser(user: LoginUserInput!): String!
    deleteAllUsers: Boolean!
    uploadImage(image: ImageInput!): Boolean
    createTrip(trip: TripInput): Trip
    createPost(post: PostInput): Post
    deleteTrip(id: ID): String
    deleteAllTrips: String
    updatePost(id: ID, post: PostInput): Post
  }
`;

export default typeDefs;
