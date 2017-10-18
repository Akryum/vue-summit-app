export function filterQuestion (question, filter) {
  if (!filter || Object.keys(filter).length === 0) {
    return true
  } else {
    if (typeof filter.text !== 'undefined') {
      return false
    }

    if (typeof filter.answered !== 'undefined') {
      return filter.answered === question.answered
    }
  }
}
