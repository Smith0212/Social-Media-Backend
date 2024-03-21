const CustomAPIError = require("./customError");
const { StatusCodes } = require("http-status-codes")

class Badrequest extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCodes = StatusCodes.BAD_REQUEST
    }
}

module.exports = Badrequest