require("dotenv").config();
require('express-async-errors');

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const notFound = require("./middlewares/noRouteFound")
const errorHandlerMW = require("./middlewares/error-handler")

app.use(express.json())

const router = require("./routes/routes");

app.get("/", (req, res) => {    
    res.send("Welcome to Social Media API");
});

app.use("/api/v1", router);
app.use(notFound)
app.use(errorHandlerMW)

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server Started at port ${process.env.PORT || 3000}`);
    });
});

module.exports = app; // for testing




