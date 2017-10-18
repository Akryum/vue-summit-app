import { MongoClient } from 'mongodb'
import { MONGO_URL } from '../config'

export let db

export function getDb () {
  return new Promise((resolve, reject) => {
    MongoClient.connect(MONGO_URL, (err, result) => {
      if (err) {
        reject(err)
      } else {
        console.log('Connected to MongoDB')
        db = result
        resolve(result)
      }
    })
  })
}
