const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sensor = require('./router');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/', sensor);

// local db 請改 mongoose.connect("mongodb://localhost:27017/<db_name>"）
// altas db 請將 @cluster0-9megj.mongodb.net改成自己cluster，並在nodemon改自己的user_name,user_password,db_name
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-9megj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  ).then(() => {
    console.log('Connection Mongodb successful');
    app.listen(8000);
  }).catch((err) => {
    console.log(err);
  });
