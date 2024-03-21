const CustomAPIError = require("./customError");
const { StatusCodes } = require("http-status-codes")

class Notfound extends CustomAPIError {
    constructor(message) {
        super(message)
        this.statusCodes = StatusCodes.NOT_FOUND
    }
}

module.exports = Notfound