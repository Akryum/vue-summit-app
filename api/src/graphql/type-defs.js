export default [`
scalar Date

type User @cacheControl(maxAge: 300) {
  id: ID!
  name: String!
  avatar: String!
  email: String
  admin: Boolean
}

type Session {
  id: ID!
  title: String!
  description: String
  public: Boolean
  user: User
  date: Date
  questions (sort: String, filter: QuestionsFilter): [Question]
  questionCount: Int
}

input SessionInput {
  title: String!
  description: String
}

type Question {
  id: ID!
  title: String!
  # Meat of the question
  content: String!
  votes: Int!
  # Indicates if the current logged user if any has already voted the question.
  hasVoted: Boolean
  user: User
  session: Session @cacheControl(maxAge: 300)
  date: Date
  # Indicates if the question has been answered.
  answered: Boolean
  answers: [Answer]
  answerCount: Int
  pickedAnswer: Answer
}

input QuestionsFilter {
  # Performs a full-text search
  text: String
  answered: Boolean
}

input QuestionInput {
  title: String!
  content: String!
}

type Answer {
  id: ID!
  content: String!
  user: User
  date: Date
}

input AnswerInput {
  content: String!
}

type Query {
  # Currently logged user data
  currentUser: User @cacheControl(maxAge: 0)
  # (Admin) Any user
  user (id: ID!): User
  # All the questions that matches the filter if any
  questions (sessionId: ID!, sort: String, filter: QuestionsFilter): [Question]
  # One question
  question (id: ID!): Question
  # All the public sessions
  sessionsPublic: [Session]
  # (Admin) All the sessions
  sessionsAll: [Session]
  # (User) User sessions
  sessionsUser: [Session]
  # A specific session
  session (id: ID!): Session
}

type Mutation {
  # (User) Add a new session
  sessionAdd (input: SessionInput!): Session
  # (User) Update a session content
  sessionUpdate (id: ID!, input: SessionInput!) :Session
  # (Admin) Toggle the session 'public' attribute (true or false)
  sessionTogglePublic (id: ID!): Session
  # (Admin) Remove a session
  sessionRemove (id: ID!): Session
  # (User) Add a question to a session
  questionAdd (sessionId: ID!, input: QuestionInput!): Question
  # (User) Update a question content
  questionUpdate (id: ID!, input: QuestionInput!): Question
  # (User) Toggle the vote of current user on a question
  questionToggleVoted (id: ID!): Question
  # (User) Toggle the answered state of the question
  questionSetPickedAnswer (id: ID!, answerId: ID): Question
  # (Admin) Remove a question
  questionRemove (id: ID!): Question
  # (User) Add an answer to a question
  answerAdd (questionId: ID!, input: AnswerInput!): Answer
  # (User) Update an answer content
  answerUpdate (questionId: ID!, id: ID!, input: AnswerInput!): Answer
  # (Admin) Remove an aswer from a question
  answerRemove (questionId: ID!, id: ID!): Answer
}

type Subscription {
  # When a session is made public
  sessionAdded: Session
  sessionUpdated: Session
  sessionDetailsUpdated (id: ID!): Session
  # When a session is made private or removed
  sessionRemoved: Session
  questionAdded (sessionId: ID!, filter: QuestionsFilter): Question
  questionUpdated (sessionId: ID!, filter: QuestionsFilter): Question
  questionRemoved (sessionId: ID!, filter: QuestionsFilter): Question
  answerAdded (questionId: ID!): Answer
  answerUpdated (questionId: ID!): Answer
  answerRemoved (questionId: ID!): Answer
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`]
