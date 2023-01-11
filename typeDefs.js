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
    email: String!
    status: String
    firstName: String
    lastName: String
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
    _id: String
    assignee: String
    creatorId: String
    title: String
    isDone: Boolean
  }

  type Image {
    _id: String
    uri: String!
    title: String
    description: String
    author: String
    createdAt: String
  }

  type InitDataResponse {
    userData: User
    trips: [Trip]
    activeTrip: ConcatedTrip
    recapTrip: Trip
    images: [Image]
  }

  type ConcatedTrip {
    id: ID
    hostId: String
    thumbnailUri: String
    title: String
    description: String
    location: Location
    invitees: [Invitee]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [Image]
    polls: [Poll]
    mutualTasks: [Task]
    privateTasks: [Task]
  }

  type Poll {
    _id: String
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
    id: String
  }

  type Expense {
    _id: String
    creatorId: String
    title: String
    amount: Float
    currency: String
    createdAt: String
  }

  type InvitationResponse {
    title: String
    description: String
    dateRange: DateRange
    location: Location
    hostName: String
  }

  type TripImagesResponse {
    createdAt: String
    uri: String!
    title: String
    description: String
    author: Author
  }

  type Author {
    firstName: String
    lastName: String
    avatarUri: String
  }

  type Query {
    # user queries
    me: User
    getAllUsers: [User]
    getUserById(id: ID): User
    getUserInitData: InitDataResponse

    # trip queries
    getAllTrips: [Trip]
    getTripById(tripId: String): ConcatedTrip
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
    invitees: [String]
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

  input AddInviteeInput {
    tripId: String!
    emails: [String]!
  }

  input RemoveInviteeInput {
    tripId: String!
    email: String!
  }

  input DeleteInput {
    tripId: String!
    id: String!
    isPrivate: Boolean
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

  input UpdateTaskInput {
    taskId: String!
    isDone: Boolean!
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
    addInvitees(data: AddInviteeInput!): Boolean
    removeInvitee(data: RemoveInviteeInput!): Boolean

    # Expenses
    createExpense(expense: ExpenseInput!): String
    deleteExpense(data: DeleteInput!): Boolean

    # Polls
    createPoll(poll: PollInput!): String
    deletePoll(data: DeleteInput!): Boolean

    # Tasks
    createTask(task: TaskInput!): String
    deleteTask(data: DeleteInput!): Boolean
    updateTask(data: UpdateTaskInput!): Boolean
  }
`;

export default typeDefs;
