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
  # Indicates if the question has been answered by the speaker.
  answered: Boolean
  user: User
  session: Session @cacheControl(maxAge: 300)
  date: Date
  answers: [Answer]
  answerCount: Int
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
  # All the public sessions
  sessionsPublic: [Session]
  # (Admin) All the sessions
  sessionsAll: [Session]
  # User sessions
  sessionsUser: [Session]
  # A specific session
  session (id: ID!): Session
}

type Mutation {
  sessionAdd (input: SessionInput!): Session
  # (Admin)
  sessionTogglePublic (id: ID!): Session
  # (Admin)
  sessionRemove (id: ID!): Session
  questionAdd (sessionId: ID!, input: QuestionInput!): Question
  questionToggleVoted (id: ID!): Question
  questionToggleAnswered (id: ID!): Question
  questionRemove (id: ID!): Question
  answerAdd (questionId: ID!, input: AnswerInput!): Answer
  answerRemove (questionId: ID!, id: ID!): Answer
}

type Subscription {
  questionAdded (sessionId: ID!, filter: QuestionsFilter): Question
  questionUpdated (sessionId: ID!, filter: QuestionsFilter): Question
  questionRemoved (sessionId: ID!, filter: QuestionsFilter): Question
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`]
