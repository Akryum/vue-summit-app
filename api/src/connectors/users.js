import { db } from '../utils/db'
import LRU from 'lru-cache'

const cache = new LRU({
  max: 500,
  maxAge: 1000 * 60 * 15,
})

export function users () {
  return db.collection('users')
}

function processItem (item, context) {
  item.id = item._id
}

export async function getById (id) {
  let user = cache.get(id)
  if (!user) {
    user = await users().findOne({
      userId: id,
    })
    user && processItem(user)
    cache.set(id, user)
  }
  return user
}

export async function findOrCreate (data) {
  let result
  const user = await getById(data.userId)
  if (user) {
    await users().updateOne({
      _id: user._id,
    }, data)
    result = {
      ...user,
      ...data,
    }
  } else {
    const { insertedId } = await users().insert({
      ...data,
    })

    result = {
      _id: insertedId,
      ...data,
    }
  }
  processItem(result)
  return result
}
