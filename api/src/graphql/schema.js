import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from './type-defs'
import resolvers from './resolvers'

const jsSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default jsSchema
