import moment from 'moment'

export function date (value, format) {
  return moment(value).format(format)
}

export function fromNow (value) {
  return moment(value).fromNow()
}
