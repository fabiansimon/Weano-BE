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
    pushToken: String
    countriesVisited: [String]
    friends: [String]
    isProMember: Boolean
  }

  type UserExpense {
    expense: String
    trip: String
  }

  type DateRange {
    startDate: Int
    endDate: Int
  }

  type Location {
    placeName: String
    latlon: [Float]
  }

  type SimplifiedTrip {
    id: ID
    thumbnailUri: String
    title: String
    destinations: [Location]
    description: String
    dateRange: DateRange
    images: [Image]
    openTasks: [Task]
    activeMembers: [User]
    documents: [Document]
    type: String
    userFreeImages: Int
  }

  type Task {
    _id: String
    createdAt: String
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
    trips: [SimplifiedTrip]
    freeTierLimits: String
    premiumTierLimits: String
  }

  type ConcatedTrip {
    id: ID
    hostIds: [String]
    thumbnailUri: String
    title: String
    description: String
    destinations: [Location]
    activeMembers: [User]
    dateRange: DateRange
    expenses: [Expense]
    images: [Image]
    polls: [Poll]
    mutualTasks: [Task]
    privateTasks: [Task]
    documents: [Document]
    packingItems: [PackingItem]
    type: String
    userFreeImages: Int
    currency: Currency
  }

  type Currency {
    symbol: String
    string: String
  }

  type Document {
    _id: String
    title: String
    uri: String
    creatorId: String
    type: String
    createdAt: String
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
    paidBy: String
  }

  type TripImagesResponse {
    images: [TripImage]
    userFreeImages: Int
  }

  type TripImage {
    _id: String
    createdAt: String
    uri: String!
    title: String
    description: String
    author: Author
    userFreeImages: Int
  }
  type Author {
    _id: String
    firstName: String
    lastName: String
    avatarUri: String
  }

  type PollResponse {
    id: String
    options: [PollOption]
  }

  type PackingItem {
    _id: String
    title: String!
    amount: Int!
    isPacked: Boolean
  }

  type Query {
    # user queries
    me: User
    getAllUsers: [User]
    getUserById(id: ID): User
    getUserInitData: InitDataResponse

    # trip queries
    getTripById(tripId: String, isInvitation: Boolean): ConcatedTrip
    getTripsForUser: [SimplifiedTrip]
    getImagesFromTrip(tripId: String): TripImagesResponse
  }

  input DateRangeInput {
    startDate: Int
    endDate: Int
  }

  input TripInput {
    title: String
    description: String
    destination: LocationInput
    dateRange: DateRangeInput
  }

  input LocationInput {
    placeName: String
    latlon: [Float]
  }

  input RegisterUserInput {
    phoneNumber: String
    googleIdToken: String
    avatarUri: String
    email: String
    firstName: String
    lastName: String
  }

  input LoginUserInput {
    phoneNumber: String
    email: String
    googleIdToken: String
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
    pushToken: String
    isProMember: Boolean
  }

  input ExpenseInput {
    title: String!
    amount: Float!
    tripId: String!
    currency: String
    paidBy: String
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
    destinations: [LocationInput]
    dateRange: DateRangeInput
    currency: CurrencyInput
    newHost: String
    # activeMembers
    # images
    # expenses
  }

  input CurrencyInput {
    symbol: String!
    string: String!
  }

  input UpdateTaskInput {
    taskId: String!
    isDone: Boolean!
  }

  input UpdatePackingItemInput {
    id: String!
    isPacked: Boolean!
    amount: Int
  }

  input VoteInput {
    pollId: String!
    optionId: String!
  }

  input ReminderInput {
    receivers: [String]!
    title: String!
    description: String!
    type: String!
    tripId: String!
  }

  input DocumentInput {
    type: String!
    uri: String!
    tripId: String!
    title: String!
  }

  input PackingItemInput {
    title: String!
    amount: Int
  }

  input PackingListInput {
    tripId: String!
    items: [PackingItemInput]
  }

  type Mutation {
    # User
    registerUser(user: RegisterUserInput!): String!
    loginUser(user: LoginUserInput!): String!
    deleteUser: Boolean
    joinTrip(tripId: ID): Boolean
    updateUser(user: UserInput): Boolean

    # Trip
    createTrip(trip: TripInput): String!
    deleteTripById(tripId: ID): Boolean
    updateTrip(trip: UpdatedTripInput!): Boolean
    removeUserFromTrip(data: DeleteInput!): Boolean

    # Expenses
    createExpense(expense: ExpenseInput!): String
    deleteExpense(data: DeleteInput!): Boolean

    # Polls
    createPoll(poll: PollInput!): PollResponse
    deletePoll(data: DeleteInput!): Boolean
    voteForPoll(data: VoteInput!): Boolean

    # Tasks
    createTask(task: TaskInput!): String
    deleteTask(data: DeleteInput!): Boolean
    updateTask(data: UpdateTaskInput!): Boolean

    # Push Notifications
    sendReminder(data: ReminderInput!): Boolean

    # Images
    uploadTripImage(image: ImageInput!): TripImage
    deleteImage(data: DeleteInput!): Boolean

    # Documents
    uploadDocument(document: DocumentInput!): Document
    deleteDocument(data: DeleteInput!): Boolean

    # Packing Items
    createPackingList(packingData: PackingListInput!): [PackingItem]
    deletePackingItem(data: DeleteInput!): Boolean
    updatePackingItem(data: UpdatePackingItemInput!): Boolean
  }
`;

export default typeDefs;
