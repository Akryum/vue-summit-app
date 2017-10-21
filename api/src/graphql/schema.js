import { makeExecutableSchema } from 'graphql-tools'
import OpticsAgent from 'optics-agent'

import typeDefs from './type-defs'
import resolvers from './resolvers'

const jsSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

OpticsAgent.instrumentSchema(jsSchema)

export default jsSchema
