const express= require('express');

const { mongoose }= require('./db.js');

const app = express()
const port = 3000

app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})