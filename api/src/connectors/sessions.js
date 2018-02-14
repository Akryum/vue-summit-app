import { db } from '../utils/db'
import { ObjectId } from 'mongodb'

export function sessions () {
  return db.collection('sessions')
}

function generateSelector (filter, context) {
  const selector = {}
  const fields = {
    title: 1,
    description: 1,
    public: 1,
    date: 1,
    userId: 1,
  }
  if (filter) {
    if (typeof filter.public !== 'undefined') {
      selector.public = filter.public
    }

    if (typeof filter.userId !== 'undefined') {
      selector.userId = filter.userId
    }
  }
  return {
    selector,
    fields,
  }
}

function processItem (item, context) {
  item.id = item._id.toString()
}

export async function getById (id) {
  const oid = ObjectId(id)
  const session = await sessions().findOne({
    _id: oid,
  })
  session && processItem(session)
  return session
}

export async function getMany ({
  sort,
  filter,
}, context) {
  const { selector, fields } = generateSelector(filter, context)

  const cursor = await sessions().find(
    selector,
    {
      fields,
      sort: { date: -1 },
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
    title: input.title.substr(0, 60),
    description: input.description.substr(0, 1000),
    userId: context.user.userId,
    public: false,
    date: new Date(),
  }
  const { insertedId } = await sessions().insertOne(data)
  data._id = insertedId
  processItem(data, context)
  return data
}

export async function updateDetails ({ id, input }, context) {
  const oid = ObjectId(id)
  const session = await sessions().findOne({
    _id: oid,
  })
  if (session && (
    session.userId === context.user.userId ||
    context.user.admin
  )) {
    Object.assign(session, input)
    await sessions().updateOne({
      _id: oid,
    }, {
      $set: input,
    })
    processItem(session, context)
  }
  return session
}

export async function togglePublic ({ id }, context) {
  const oid = ObjectId(id)
  const session = await sessions().findOne({
    _id: oid,
  })
  if (session) {
    const newValue = !session.public
    session.public = newValue
    await sessions().updateOne({
      _id: oid,
    }, {
      $set: { public: newValue },
    })
    processItem(session, context)
    return session
  } else {
    throw new Error(404)
  }
}

export async function removeOne ({ id }, context) {
  const oid = ObjectId(id)
  const session = await sessions().findOne({
    _id: oid,
  })
  await sessions().deleteOne({
    _id: oid,
  })
  session && processItem(session, context)
  return session
}
