const express = require('express')
const app = express()
const imageRoute = require('./routes/index')

app.use('/image', imageRoute)

app.listen(8080, () => console.log('App listening on port 8080!'))

module.exports = {
  app
}