export default [`
scalar Date

type User {
  id: ID!
  name: String!
  avatar: String!
  admin: Boolean
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
  date: Date
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

type Query {
  # Currently logged user data
  currentUser: User
  # Retrieves all the questions that matches the filter if any
  questions (sort: String, filter: QuestionsFilter): [Question]
}

type Mutation {
  questionAdd (input: QuestionInput!): Question
  questionToggleVoted (id: ID!): Question
  questionToggleAnswered (id: ID!): Question
  questionRemove (id: ID!): Question
}

type Subscription {
  questionAdded (filter: QuestionsFilter): Question
  questionUpdated (filter: QuestionsFilter): Question
  questionRemoved (filter: QuestionsFilter): Question
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`]
