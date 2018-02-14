// TODO
import ANSWERS_QUERY from '../graphql/QuestionAnswers.gql'

export function cacheAnswerAddToList (list, item) {
  const index = list.findIndex(
    i => i.id === item.id
  )
  if (index === -1) {
    list.splice(0, 0, item)
  }
}

export function cacheAnswerRemoveFromList (list, item) {
  const index = list.findIndex(
    i => i.id === item.id
  )
  if (index !== -1) {
    list.splice(index, 1)
  }
}

export function cacheAnswerAdd (store, {
  questionId,
}, item) {
  const query = {
    query: ANSWERS_QUERY,
    variables: {
      questionId,
    },
  }

  // Read the cache
  const data = store.readQuery(query)

  // Transformation
  cacheAnswerAddToList(data.question.answers, item)

  // Write the result to the cache
  store.writeQuery({ ...query, data })
}

export function cacheAnswerRemove (store, {
  questionId,
}, item) {
  const query = {
    query: ANSWERS_QUERY,
    variables: {
      questionId,
    },
  }

  // Read the cache
  const data = store.readQuery(query)

  // Transformation
  cacheAnswerRemoveFromList(data.question.answers, item)

  // Write the result to the cache
  store.writeQuery({ ...query, data })
}
