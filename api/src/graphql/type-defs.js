export default [`
scalar Date

type User {
  id: ID!
  name: String!
  avatar: String!
}

type Question {
  id: ID!
  title: String!
  content: String!
  votes: Int!
  # Indicates if the current logged user if any has already voted the question.
  hasVoted: Boolean
  answered: Boolean
  user: User
  date: Date
}

input QuestionsFilter {
  text: String
  answered: Boolean
}

input QuestionInput {
  title: String!
  content: String!
}

type Query {
  questions (sort: String, filter: QuestionsFilter): [Question]
}

type Mutation {
  addQuestion (input: QuestionInput!): Question
  toggleQuestionVote (id: ID!): Question
  toggleQuestionAnswered (id: ID!): Question
  removeQuestion (id: ID!): Boolean
}

type Subscription {
  questionAdded (filter: QuestionsFilter): Question
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`]
