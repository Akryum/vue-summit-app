import { db } from '../utils/db'

export function users () {
  return db.collection('users')
}

function processItem (item, context) {
  item.id = item._id.toString()
}

export async function getById (id) {
  const user = await users().findOne({
    userId: id,
  })
  user && processItem(user)
  return user
}

export async function findOrCreate (data) {
  let result
  const user = await getById(data.userId)
  if (user) {
    result = {
      ...user,
      ...data,
    }
    await users().updateOne({
      _id: user._id,
    }, result)
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
