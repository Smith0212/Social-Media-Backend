const CustomAPIError = require("./customError");
const { StatusCodes } = require("http-status-codes")

class Notfound extends CustomAPIError {
    constructor(message) {
        console.log("hello")
        super(message)
        this.statusCodes = StatusCodes.NOT_FOUND
        console.log(this.statusCodes)
    }
}

module.exports = Notfound