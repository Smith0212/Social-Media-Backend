const CustomAPIError = require('./customError')
const BadRequestError = require('./BadRequest')
const UnauthenticatedError = require('./Unauthorized')
const NotFoundError = require('./Notfound')

module.exports = {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
}
