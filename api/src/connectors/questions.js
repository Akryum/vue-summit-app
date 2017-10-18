import { db } from '../utils/db'
import { ObjectId } from 'mongodb'

export function questions () {
  return db.collection('questions')
}

function generateSelector (filter, context) {
  const selector = {}
  const fields = {
    title: 1,
    content: 1,
    votes: 1,
    votesList: 1,
    date: 1,
    userId: 1,
  }
  if (filter) {
    if (typeof filter.text !== 'undefined') {
      selector.$text = { $search: filter.text }
      fields.score = { $meta: 'textScore' }
    }

    if (typeof filter.answered !== 'undefined') {
      selector.answered = filter.answered
    }
  }
  return {
    selector,
    fields,
  }
}

function processItem (item, context) {
  item.id = item._id
  item.hasVoted = context.user && item.votesList.includes(context.user.userId)
}

export async function getMany ({
  sort,
  filter,
}, context) {
  const { selector, fields } = generateSelector(filter, context)

  let sortOption
  if (sort === 'text') {
    sortOption = { score: { $meta: 'textScore' } }
  } else if (sort === 'newest') {
    sortOption = { date: -1 }
  } else {
    sortOption = { votes: -1 }
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

export async function addOne ({ input }, context) {
  const data = {
    ...input,
    votes: 0,
    votesList: [],
    answered: false,
    userId: context.user.userId,
    date: new Date(),
  }
  const { insertedId } = await questions().insertOne(data)
  data._id = insertedId
  processItem(data, context)
  return data
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
  await questions().deleteOne({
    _id: oid,
  })
  return true
}
