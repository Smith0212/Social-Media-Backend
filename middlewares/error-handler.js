const CustomAPIError = require("../errors/customError")
const { StatusCodes } = require("http-status-codes")

const errorHandlerMW = (err, req, res, next) => {
    if(err instanceof CustomAPIError){
        return res.status(err.statusCode).json({ msg: err.message })
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Something went wrong try again laterrr')
}

module.exports = errorHandlerMW;