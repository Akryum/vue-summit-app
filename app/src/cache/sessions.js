import SESSIONS_USER_QUERY from '../graphql/SessionsUser.gql'

export function cacheSessionAddToList (list, item) {
  const index = list.findIndex(
    i => i.id === item.id
  )
  if (index === -1) {
    list.splice(0, 0, item)
  }
}

export function cacheSessionRemoveFromList (list, args, item) {
  const index = list.findIndex(
    i => i.id === item.id
  )
  if (index !== -1) {
    list.splice(index, 1)
  }
}

export function cacheSessionAdd (store, item) {
  const query = {
    query: SESSIONS_USER_QUERY,
  }

  // Read the cache
  const data = store.readQuery(query)

  // Transformation
  cacheSessionAddToList(data.sessionsUser, item)

  // Write the result to the cache
  store.writeQuery({ ...query, data })
}

export function caheSessionRemove (store, item) {
  const query = {
    query: SESSIONS_USER_QUERY,
  }

  // Read the cache
  const data = store.readQuery(query)

  // Transformation
  cacheSessionRemoveFromList(data.sessionsUser, item)

  // Write the result to the cache
  store.writeQuery({ ...query, data })
}
