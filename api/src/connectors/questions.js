import { db } from '../utils/db'
import { ObjectId } from 'mongodb'
import shortid from 'shortid'

export function questions () {
  return db.collection('questions')
}

function generateSelector (filter, context) {
  const selector = {}
  const fields = {
    sessionId: 1,
    title: 1,
    content: 1,
    votes: 1,
    votesList: 1,
    answered: 1,
    date: 1,
    userId: 1,
    answers: 1,
  }
  if (filter) {
    if (typeof filter.text !== 'undefined') {
      selector.$text = { $search: filter.text }
      fields.score = { $meta: 'textScore' }
    }

    if (typeof filter.answered !== 'undefined') {
      selector.answered = filter.answered
    }

    // if (filter.mine && context.user) {
    //   selector.userId = context.user.userId
    // }
  }
  return {
    selector,
    fields,
  }
}

function processItem (item, context) {
  item.id = item._id.toString()
  item.hasVoted = context.user && item.votesList.includes(context.user.userId)
}

export async function getMany ({
  sessionId,
  sort,
  filter,
}, context) {
  const { selector, fields } = generateSelector(filter, context)

  selector.sessionId = sessionId

  let sortOption
  if (sort === 'text') {
    sortOption = { score: { $meta: 'textScore' } }
  } else if (sort === 'newer') {
    sortOption = { date: -1 }
  } else {
    sortOption = { votes: -1, date: 1 }
  }

  const cursor = await questions().find(
    selector,
    {
      fields,
      sort: sortOption,
    },
  )
  const items = await cursor.toArray()

  for (const item of items) {
    processItem(item, context)
  }

  return items
}

export async function getById (id, context) {
  const oid = ObjectId(id)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) processItem(question, context)
  return question
}

export async function count (selector, context) {
  return questions().count(selector)
}

export async function countAnswers (id, context) {
  const result = await questions().aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    {
      $project: {
        answerCount: { $size: '$answers' },
      },
    },
  ]).toArray()
  return result && result.length && result[0].answerCount
}

export async function addOne ({ sessionId, input }, context) {
  const data = {
    sessionId: sessionId,
    title: input.title.substr(0, 60),
    content: input.content.substr(0, 500),
    votes: 0,
    votesList: [],
    answered: false,
    answers: [],
    userId: context.user.userId,
    date: new Date(),
  }
  const { insertedId } = await questions().insertOne(data)
  data._id = insertedId
  processItem(data, context)
  return data
}

export async function updateDetails ({ id, input }, context) {
  const oid = ObjectId(id)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question && (
    question.userId === context.user.userId ||
    context.user.admin
  )) {
    Object.assign(question, input)
    await questions().updateOne({
      _id: oid,
    }, {
      $set: input,
    })
    processItem(question, context)
  }
  return question
}

export async function addAnswer ({ questionId, input }, context) {
  const oid = ObjectId(questionId)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) {
    const answer = {
      id: shortid.generate(),
      ...input,
      userId: context.user.userId,
      date: new Date(),
    }

    question.answers.splice(0, 0, answer)

    await questions().updateOne({
      _id: oid,
    }, {
      $push: { answers: { $each: [answer], $position: 0 } },
    })

    processItem(question, context)

    return { answer, question }
  } else {
    throw new Error(404)
  }
}

export async function removeAnswer ({ questionId, id }, context) {
  const oid = ObjectId(questionId)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) {
    const answerIndex = question.answers.findIndex(
      q => q.id === id
    )

    if (answerIndex !== -1) {
      const answer = question.answers[answerIndex]
      question.answers.splice(answerIndex, 1)

      await questions().updateOne({
        _id: oid,
      }, {
        $pull: { answers: { id } },
      })

      processItem(question, context)

      return { answer, question }
    }
  }

  throw new Error(404)
}

export async function updateAnswerDetails ({ questionId, id, input }, context) {
  const oid = ObjectId(questionId)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) {
    const answer = question.answers.find(
      q => q.id === id
    )

    if (answer && (
      answer.userId === context.user.userId ||
      context.user.admin
    )) {
      Object.assign(answer, input)

      await questions().updateOne({
        _id: oid,
        'answers.id': id,
      }, {
        $set: { 'answers.$.content': input.content },
      })

      processItem(question, context)

      return { answer, question }
    }
  }
  throw new Error(404)
}

export async function toggleVote ({ id }, context) {
  const oid = ObjectId(id)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) {
    const userId = context.user.userId
    const index = question.votesList.indexOf(userId)
    const operation = {}
    if (index === -1) {
      question.votes++
      question.votesList.push(userId)
      operation.$push = { votesList: userId }
    } else {
      question.votes--
      question.votesList.splice(index, 1)
      operation.$pull = { votesList: userId }
    }
    operation.$set = {
      votes: question.votes,
    }
    await questions().updateOne({
      _id: oid,
    }, operation)
    processItem(question, context)
    return question
  } else {
    throw new Error(404)
  }
}

export async function toggleAnswered ({ id }, context) {
  const oid = ObjectId(id)
  const question = await questions().findOne({
    _id: oid,
  })
  if (question) {
    // Access rights
    if (!context.user.admin && context.user.userId !== question.userId) return question

    const newValue = !question.answered
    question.answered = newValue
    await questions().updateOne({
      _id: oid,
    }, {
      $set: { answered: newValue },
    })
    processItem(question, context)
    return question
  } else {
    throw new Error(404)
  }
}

export async function removeOne ({ id }, context) {
  const oid = ObjectId(id)
  const question = await questions().findOne({
    _id: oid,
  })
  await questions().deleteOne({
    _id: oid,
  })
  question && processItem(question, context)
  return question
}
