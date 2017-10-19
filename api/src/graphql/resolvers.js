import * as Users from '../connectors/users'
import * as Questions from '../connectors/questions'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { filterQuestion, secure } from '../utils/filters'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const pubsub = new PubSub()

const QUESTION_ADDED_TOPIC = 'question_added'
const QUESTION_UPDATED_TOPIC = 'question_updated'
const QUESTION_REMOVED_TOPIC = 'question_removed'

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
    currentUser: (root, args, context) => {
      return context.user
    },
    questions: (root, args, context) => {
      return Questions.getMany(args, context)
    },
  },
  Mutation: {
    questionAdd: secure(async (root, args, context) => {
      const question = await Questions.addOne(args, context)
      pubsub.publish(QUESTION_ADDED_TOPIC, { questionAdded: question, context })
      return question
    }),
    questionToggleVoted: secure(async (root, args, context) => {
      const question = await Questions.toggleVote(args, context)
      pubsub.publish(QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return question
    }),
    questionToggleAnswered: secure(async (root, args, context) => {
      const question = await Questions.toggleAnswered(args, context)
      pubsub.publish(QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return question
    }, true),
    questionRemove: secure(async (root, args, context) => {
      const question = await Questions.removeOne(args, context)
      pubsub.publish(QUESTION_REMOVED_TOPIC, { questionRemoved: question, context })
      return question
    }, true),
  },
  Subscription: {
    questionAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_ADDED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionAdded, variables.filter),
      ),
    },
    questionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_UPDATED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionUpdated, variables.filter),
      ),
    },
    questionRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_REMOVED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionRemoved, variables.filter),
      ),
    },
  },
}
