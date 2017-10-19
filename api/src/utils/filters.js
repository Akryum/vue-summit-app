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

    // if (filter.mine && context.user) {
    //   return context.user.userId === question.userId
    // }
  }
}

export function secure (func, admin = false) {
  return (root, args, context) => {
    if (!context.user || (admin && !context.user.admin)) {
      throw new Error(403)
    }
    return func(root, args, context)
  }
}
