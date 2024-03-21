const notFound = (req, res) => {
    res.status(404).send("Route dose not found")
}

module.exports = notFound