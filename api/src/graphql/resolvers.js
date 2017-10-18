import * as Users from '../connectors/users'
import * as Questions from '../connectors/questions'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { filterQuestions } from '../utils/filters'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const pubsub = new PubSub()

const QUESTION_ADDED_TOPIC = 'questions_added'

function secure (func, admin = false) {
  return (root, args, context) => {
    if (!context.user || (admin && !context.user.admin)) {
      throw new Error(403)
    }
    return func(root, args, context)
  }
}

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue (value) {
      return new Date(value) // value from the client
    },
    serialize (value) {
      return value.getTime() // value sent to the client
    },
    parseLiteral (ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10) // ast value is always in string format
      }
      return null
    },
  }),
  Question: {
    user: (question, args, context) => {
      return Users.getById(question.userId)
    },
  },
  Query: {
    questionsPage: (root, args, context) => {
      return Questions.getPage(args, context)
    },
  },
  Mutation: {
    addQuestion: secure(async (root, args, context) => {
      return Questions.addOne(args, context)
    }),
    toggleQuestionVote: secure(async (root, args, context) => {
      return Questions.toggleVote(args, context)
    }),
    toggleQuestionAnswered: secure(async (root, args, context) => {
      return Questions.toggleAnswered(args, context)
    }, true),
    removeQuestion: secure(async (root, args, context) => {
      return Questions.removeOne(args, context)
    }, true),
  },
  Subscription: {
    questionAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_ADDED_TOPIC),
        (payload, variables) => filterQuestions(payload.questionAdded, variables.filter),
      ),
    },
  },
}
