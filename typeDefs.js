import { gql } from "apollo-server-express";

const typeDefs = gql`
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

  type Location {
    placeName: String
    latlon: [Float]
  }

  type Trip {
    id: ID
    thumbnailUri: String
    title: String
    description: String
    location: Location
    invitees: [Invitee]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [String]
    mutualTasks: [Task]
    privateTasks: [Task]
  }

  type Task {
    assignee: String
    creatorId: String
    title: String
    isDone: Boolean
  }

  type Image {
    uri: String!
    title: String
    description: String
    author: String
    createdAt: String
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
    location: Location
    invitees: [Invitee]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [String]
    polls: [Poll]
    mutualTasks: [Task]
    privateTasks: [Task]
  }

  type Poll {
    creatorId: String
    title: String
    description: String
    createdAt: String
    options: [PollOption]
  }

  type PollOption {
    option: String
    votes: [String]
    creatorId: String
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
    expenses: [Expense]
    activeMembers: [User]
  }

  input InviteeInput {
    phoneNumber: String
    status: String
    fullName: String
  }

  type InvitationResponse {
    title: String
    description: String
    dateRange: DateRange
    location: Location
    hostName: String
  }

  type TripImagesResponse {
    uri: String!
    title: String
    description: String
    author: String
  }

  type Query {
    # user queries
    me: User
    getAllUsers: [User]
    getUserById(id: ID): User
    getUserInitData: InitDataResponse

    # trip queries
    getAllTrips: [Trip]
    getTripById(tripId: String): TripResponse
    getTripsForUser: [Trip]
    getInvitationTripData(tripId: String): InvitationResponse
    getImagesFromTrip(tripId: String): [TripImagesResponse]
  }

  input DateRangeInput {
    startDate: Int
    endDate: Int
  }

  input TripInput {
    title: String
    description: String
    location: LocationInput
    invitees: [InviteeInput]
    dateRange: DateRangeInput
  }

  input LocationInput {
    placeName: String
    latlon: [Float]
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

  input PollInput {
    title: String!
    description: String
    tripId: String!
    options: [PollOptionInput]
  }

  input TaskInput {
    title: String!
    tripId: String!
    assignee: String
    creatorId: String
    isPrivate: Boolean
  }

  input PollOptionInput {
    option: String!
    votes: [String]
  }

  input UpdatedTripInput {
    tripId: String!
    thumbnailUri: String
    title: String
    description: String
    location: LocationInput
    dateRange: DateRangeInput
    # invitees:
    # activeMembers
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
    createTrip(trip: TripInput): String!
    deleteTrip(id: ID): String
    deleteAllTrips: String
    updateTrip(trip: UpdatedTripInput!): Boolean

    # Expenses
    createExpense(expense: ExpenseInput!): Boolean

    # Polls
    createPoll(poll: PollInput!): Boolean

    # Tasks
    createTask(task: TaskInput!): Boolean
  }
`;

export default typeDefs;
