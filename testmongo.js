const { MongoClient } = require("mongodb");
const cookieParser = require('cookie-parser');
// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://samyog101:samyog101@ckmdb.vz1vhhd.mongodb.net/?retryWrites=true&w=majority&appName=ckmdb";

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
// app.get('/', function(req, res) {
//   const myquery = req.query;
//   var outstring = 'Starting... ';
//   res.send(outstring);
// });

app.use(cookieParser());

// Default route:
app.get('/', function(req, res) {
  let form = '<form action="/login" method="post">';
  form += 'UserId: <input type="text" name="userId"><br>';
  form += 'UserPass: <input type="password" name="userPass"><br>';
  form += '<input type="submit" value="Login">';
  form += '<input type="submit" value="Register" formaction="/register">';
  form += '</form>';
  res.send(form);
});

app.post('/login', async function(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('ckmdb');
  const parts = database.collection('auth');
  const query = { userID: req.body.userId, userPass: req.body.userPass };
  const user = await parts.findOne(query);
  if(user) {
    res.cookie('cook1', 'xyz', {maxAge : 60000});  //Sets auth = true expiring in 20 seconds 
    res.send('Login successful');
  } else {
    res.send('Login unsuccessful. <a href="/">Go back</a>');
  }
  await client.close();
});

app.post('/register', async function(req, res) {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('ckmdb');
  const parts = database.collection('auth');
  const newUser = { userID: req.body.userId, userPass: req.body.userPass };
  await parts.insertOne(newUser);
  res.send('Registration successful. <a href="/">Go back</a>');
  await client.close();
});




app.get('/say/:name', function(req, res) {
  res.send('Hello ' + req.params.name + '!');
});


// Route to access database:
app.get('/api/mongo/:item', function(req, res) {
const client = new MongoClient(uri);
const searchKey = "{ userID: '" + req.params.item + "' }";
console.log("Looking for: " + searchKey);

async function run() {
  try {
    const database = client.db('ckmdb');
    const parts = database.collection('auth');

    // Hardwired Query for a part that has partID '12345'
    // const query = { partID: '12345' };
    // But we will use the parameter provided with the route
    const query = { userID: req.params.item };

    const part = await parts.findOne(query);
    console.log(part);
    res.send('Found this: ' + JSON.stringify(part));  //Use stringify to print a json

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}



run().catch(console.dir);
});

