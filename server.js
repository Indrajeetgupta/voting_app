const express = require('express')
const app = express()
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
require('./db');


const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})