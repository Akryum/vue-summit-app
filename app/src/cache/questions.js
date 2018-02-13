import { filterQuestion } from '../utils/filters'
import QUESTIONS_QUERY from '../graphql/Questions.gql'

export function cacheQuestionAddToList (list, { sessionId, filter, sort }, item) {
  if (filterQuestion(item, sessionId, filter)) {
    const index = list.findIndex(
      i => i.id === item.id
    )
    if (index === -1) {
      if (sort === 'newest') {
        list.splice(0, 0, item)
      } else {
        list.push(item)
      }
    }
  }
}

export function cacheQuestionRemoveFromList (list, item) {
  const index = list.findIndex(
    i => i.id === item.id
  )
  if (index !== -1) {
    list.splice(index, 1)
  }
}

export function cacheQuestionAdd (store, {
  sessionId,
  filter,
  sort,
}, item) {
  if (sort !== 'text') {
    const query = {
      query: QUESTIONS_QUERY,
      variables: {
        sessionId,
        filter,
        sort,
      },
    }

    // Read the cache
    const data = store.readQuery(query)

    // Transformation
    cacheQuestionAddToList(data.questions, {
      sessionId,
      filter,
      sort,
    }, item)

    // Write the result to the cache
    store.writeQuery({ ...query, data })
  }
}

export function cacheQuestionRemove (store, {
  sessionId,
  filter,
  sort,
}, item) {
  if (sort !== 'text') {
    const query = {
      query: QUESTIONS_QUERY,
      variables: {
        sessionId,
        filter,
        sort,
      },
    }

    // Read the cache
    const data = store.readQuery(query)

    // Transformation
    cacheQuestionRemoveFromList(data.questions, item)

    // Write the result to the cache
    store.writeQuery({ ...query, data })
  }
}
