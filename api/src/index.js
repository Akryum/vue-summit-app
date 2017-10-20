import setupDatabase from './setup/database'
import setupPassport from './setup/passport'
import setupExpress from './setup/express'

async function main () {
  await setupDatabase()
  await setupPassport()
  await setupExpress()
}

main()
