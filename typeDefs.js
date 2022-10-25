import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Post {
    id: ID
    title: String
    description: String
  }

  type User {
    id: ID
    phoneNumber: String
    avatarUri: String
    email: String
    firstName: String
    lastName: String
    images: [String]
    trips: [String]
  }

  type DateRange {
    startDate: Int
    endDate: Int
  }

  type Invitee {
    phoneNumber: String!
    status: String
  }

  type Trip {
    id: ID
    title: String
    location: String
    invitees: [Invitee]
    dateRange: DateRange
  }

  type Image {
    uri: String!
    title: String
    description: String
  }

  type InitDataResponse {
    userData: User
    trips: [Trip]
    images: [Image]
  }

  input InviteeInput {
    phoneNumber: String
    status: String
  }

  type Query {
    me: User
    getAllTrips: [Trip]
    getPost(id: ID): Post
    getAllUsers: [User]
    getUserById(id: ID): User
    getUserInitData: InitDataResponse
  }

  input PostInput {
    title: String
    description: String
  }

  input DateRangeInput {
    startDate: Int
    endDate: Int
  }

  input TripInput {
    title: String
    location: String
    invitees: [InviteeInput]
    dateRange: DateRangeInput
  }

  input RegisterUserInput {
    phoneNumber: String!
    avatarUri: String
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
    createTrip(trip: TripInput): Boolean
    createPost(post: PostInput): Post
    deleteTrip(id: ID): String
    deleteAllTrips: String
    deleteUser: Boolean
    updatePost(id: ID, post: PostInput): Post
  }
`;

export default typeDefs;
