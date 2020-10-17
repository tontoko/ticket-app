import moment from 'moment'

export const toUtcIso8601str = (momentInstance: moment.Moment) => {
  return momentInstance.clone().utc().format('YYYY-MM-DDTHH:mm:00Z')
}
