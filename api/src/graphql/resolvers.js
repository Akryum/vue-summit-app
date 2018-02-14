import * as Users from '../connectors/users'
import * as Questions from '../connectors/questions'
import * as Sessions from '../connectors/sessions'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { filterQuestion, secure } from '../utils/filters'
import * as PubSubChannels from './channels'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const pubsub = new PubSub()

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

  User: {
    email: secure((user, args, context) => {
      return user.email
    }, true),
  },

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
    user: secure((root, { id }, context) => {
      return Users.getById(id)
    }, true),
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
    question: (root, { id }, context) => {
      return Questions.getById(id, context)
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
    sessionAdd: secure(async (root, args, context) => {
      const session = await Sessions.addOne(args, context)
      // No pubsub for now
      return session
    }),
    sessionUpdate: secure(async (root, args, context) => {
      const session = await Sessions.updateDetails(args, context)
      pubsub.publish(PubSubChannels.SESSION_UPDATED_TOPIC, { sessionUpdated: session, context })
      pubsub.publish(PubSubChannels.SESSION_DETAILS_UPDATED_TOPIC, { sessionDetailsUpdated: session, context })
      return session
    }),
    sessionTogglePublic: secure(async (root, args, context) => {
      const session = await Sessions.togglePublic(args, context)
      pubsub.publish(PubSubChannels.SESSION_DETAILS_UPDATED_TOPIC, { sessionDetailsUpdated: session, context })
      if (session.public) {
        pubsub.publish(PubSubChannels.SESSION_ADDED_TOPIC, { sessionAdded: session, context })
      } else {
        pubsub.publish(PubSubChannels.SESSION_REMOVED_TOPIC, { sessionRemoved: session, context })
      }
      return session
    }, true),
    sessionRemove: secure(async (root, args, context) => {
      const session = await Sessions.removeOne(args, context)
      pubsub.publish(PubSubChannels.SESSION_REMOVED_TOPIC, { sessionRemoved: session, context })
      return session
    }, true),

    questionAdd: secure(async (root, args, context) => {
      const question = await Questions.addOne(args, context)
      pubsub.publish(PubSubChannels.QUESTION_ADDED_TOPIC, { questionAdded: question, context })
      return question
    }),
    questionUpdate: secure(async (root, args, context) => {
      const question = await Questions.updateDetails(args, context)
      pubsub.publish(PubSubChannels.QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return question
    }),
    questionToggleVoted: secure(async (root, args, context) => {
      const question = await Questions.toggleVote(args, context)
      pubsub.publish(PubSubChannels.QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return question
    }),
    questionToggleAnswered: secure(async (root, args, context) => {
      const question = await Questions.toggleAnswered(args, context)
      pubsub.publish(PubSubChannels.QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return question
    }),
    questionRemove: secure(async (root, args, context) => {
      const question = await Questions.removeOne(args, context)
      pubsub.publish(PubSubChannels.QUESTION_REMOVED_TOPIC, { questionRemoved: question, context })
      return question
    }, true),

    answerAdd: secure(async (root, args, context) => {
      const { answer, question } = await Questions.addAnswer(args, context)
      pubsub.publish(PubSubChannels.ANSWER_ADDED_TOPIC, { answerAdded: answer, questionId: args.questionId, context })
      pubsub.publish(PubSubChannels.QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return answer
    }),
    answerUpdate: secure(async (root, args, context) => {
      const { answer } = await Questions.updateAnswerDetails(args, context)
      pubsub.publish(PubSubChannels.ANSWER_UPDATED_TOPIC, { answerUpdated: answer, questionId: args.questionId, context })
      return answer
    }),
    answerRemove: secure(async (root, args, context) => {
      const { answer, question } = await Questions.removeAnswer(args, context)
      pubsub.publish(PubSubChannels.ANSWER_REMOVED_TOPIC, { answerRemoved: answer, questionId: args.questionId, context })
      pubsub.publish(PubSubChannels.QUESTION_UPDATED_TOPIC, { questionUpdated: question, context })
      return answer
    }, true),
  },

  Subscription: {
    sessionAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.SESSION_ADDED_TOPIC),
        (payload, variables) => payload.sessionAdded.public,
      ),
    },
    sessionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.SESSION_UPDATED_TOPIC),
        (payload, variables) => payload.sessionUpdated.public,
      ),
    },
    sessionDetailsUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.SESSION_DETAILS_UPDATED_TOPIC),
        (payload, variables) => payload.sessionDetailsUpdated.id === variables.id,
      ),
    },
    sessionRemoved: {
      subscribe: () => pubsub.asyncIterator(PubSubChannels.SESSION_REMOVED_TOPIC),
    },

    questionAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.QUESTION_ADDED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionAdded, variables.sessionId, variables.filter),
      ),
    },
    questionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.QUESTION_UPDATED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionUpdated, variables.sessionId, variables.filter),
      ),
    },
    questionRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.QUESTION_REMOVED_TOPIC),
        (payload, variables) => filterQuestion(payload.questionRemoved, variables.sessionId, variables.filter),
      ),
    },

    answerAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.ANSWER_ADDED_TOPIC),
        (payload, variables) => payload.questionId === variables.questionId,
      ),
    },
    answerUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.ANSWER_UPDATED_TOPIC),
        (payload, variables) => payload.questionId === variables.questionId,
      ),
    },
    answerRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PubSubChannels.ANSWER_REMOVED_TOPIC),
        (payload, variables) => payload.questionId === variables.questionId,
      ),
    },
  },
}
