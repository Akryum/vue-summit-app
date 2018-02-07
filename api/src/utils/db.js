import { MongoClient } from 'mongodb'
import { MONGO_URL, DB_NAME } from '../config'

export let db

export async function getDb () {
  const client = await MongoClient.connect(MONGO_URL)
  console.log('Connected to MongoDB')
  db = client.db(DB_NAME)
  return db
}
