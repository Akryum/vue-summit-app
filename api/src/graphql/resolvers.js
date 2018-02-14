import * as Users from '../connectors/users'
import * as Questions from '../connectors/questions'
import * as Sessions from '../connectors/sessions'
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
  Session: {
    user: (session, args, context) => {
      return Users.getById(session.userId)
    },
    questions: (session, args, context) => {
      return Questions.getMany({
        sessionId: session.id,
        ...args,
      }, context)
    },
    questionCount: (session, args, context) => {
      return Questions.count({
        sessionId: session.id,
      })
    },
  },
  Question: {
    user: (question, args, context) => {
      return Users.getById(question.userId)
    },
    session: (question, args, context) => {
      return Sessions.getById(question.sessionId)
    },
    answerCount: (question, args, context) => {
      return Questions.countAnswers(question.id)
    },
  },
  Answer: {
    user: (answer, args, context) => {
      return Users.getById(answer.userId)
    },
  },
  Query: {
    currentUser: (root, args, context) => {
      return context.user
    },
    questions: async (root, args, context) => {
      const session = await Sessions.getById(args.sessionId)

      if (session && (
        session.public ||
        (context.user && (
          context.user.admin ||
          session.userId === context.user.userId
        ))
      )) {
        return Questions.getMany(args, context)
      } else {
        return []
      }
    },
    sessionsPublic: (root, args, context) => {
      return Sessions.getMany({ filter: { public: true } }, context)
    },
    sessionsAll: secure((root, args, context) => {
      return Sessions.getMany({}, context)
    }, true),
    sessionsUser: secure((root, args, context) => {
      return Sessions.getMany({ filter: { userId: context.user.userId } }, context)
    }),
    session: async (root, { id }, context) => {
      const session = await Sessions.getById(id)
      if (session && (
        session.public ||
        (context.user && (
          context.user.admin ||
          session.userId === context.user.userId
        ))
      )) {
        return session
      }
    },
  },
  Mutation: {
    sessionAdd: secure((root, args, context) => {
      return Sessions.addOne(args, context)
    }),
    sessionTogglePublic: secure((root, args, context) => {
      return Sessions.togglePublic(args, context)
    }, true),
    sessionRemove: secure((root, args, context) => {
      return Sessions.removeOne(args, context)
    }, true),
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
    }),
    questionRemove: secure(async (root, args, context) => {
      const question = await Questions.removeOne(args, context)
      pubsub.publish(QUESTION_REMOVED_TOPIC, { questionRemoved: question, context })
      return question
    }, true),
    answerAdd: secure(async (root, args, context) => {
      const answer = await Questions.addAnswer(args, context)
      // TODO sub
      return answer
    }),
    answerRemove: secure(async (root, args, context) => {
      const answer = await Questions.removeAnswer(args, context)
      // TODO sub
      return answer
    }, true),
  },
  Subscription: {
    questionAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_ADDED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionAdded, variables.sessionId, variables.filter),
      ),
    },
    questionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_UPDATED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionUpdated, variables.sessionId, variables.filter),
      ),
    },
    questionRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(QUESTION_REMOVED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionRemoved, variables.sessionId, variables.filter),
      ),
    },
  },
}
