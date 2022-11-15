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
    expenses: [UserExpense]
  }

  type UserExpense {
    expense: String
    trip: String
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
    thumbnailUri: String
    title: String
    description: String
    location: String
    invitees: [Invitee]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [String]
  }

  type Image {
    uri: String!
    title: String
    description: String
    author: String
  }

  type InitDataResponse {
    userData: User
    trips: [Trip]
    activeTrip: ActiveTrip
    recapTrip: Trip
    images: [Image]
  }

  type ActiveTrip {
    id: ID
    thumbnailUri: String
    title: String
    description: String
    location: String
    invitees: [Invitee]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [String]
  }

  type Expense {
    creatorId: String
    title: String
    amount: Float
    currency: String
    createdAt: String
  }

  type TripResponse {
    tripData: Trip
    images: [Image]
    activeMembers: [User]
  }

  input InviteeInput {
    phoneNumber: String
    status: String
    fullName: String
  }

  type Query {
    me: User
    getAllTrips: [Trip]
    getPost(id: ID): Post
    getAllUsers: [User]
    getUserById(id: ID): User
    getTripById(tripId: String): TripResponse
    getTripsForUser: Boolean
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
    description: String
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
    author: String!
    tripId: String!
  }

  input UserInput {
    phoneNumber: String
    avatarUri: String
    email: String
    firstName: String
    lastName: String
  }

  input ExpenseInput {
    title: String!
    amount: Float!
    tripId: String!
    currency: String
  }

  input UpdatedTripInput {
    tripId: String!
    thumbnailUri: String
    title: String
    description: String
    location: String
    # invitees:
    # activeMembers
    # dateRange
    # images
    # expenses
  }

  type Mutation {
    # User
    registerUser(user: RegisterUserInput!): String!
    loginUser(user: LoginUserInput!): String!
    deleteAllUsers: Boolean!
    deleteUser: Boolean
    joinTrip(tripId: ID): Boolean
    updateUser(user: UserInput): Boolean

    # Trip
    uploadTripImage(image: ImageInput!): Boolean
    createTrip(trip: TripInput): Boolean
    deleteTrip(id: ID): String
    deleteAllTrips: String
    updateTrip(trip: UpdatedTripInput!): Boolean

    # Expenses
    createExpense(expense: ExpenseInput!): Boolean
  }
`;

export default typeDefs;
