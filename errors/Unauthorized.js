const CustomAPIError = require("./customError");
const { StatusCodes } = require("http-status-codes")

class Unauthorized extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCodes = StatusCodes.UNAUTHORIZED
    }
}

module.exports = Unauthorized