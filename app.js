const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql')
// const schema = require('./graphql/schema');
const mongoose = require('mongoose');

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const cors = require('cors');
require('dotenv').config();

const Task = require('./models/task');


// MONGOOSE CONNECTION
mongoose
  .connect(process.env.MONGODB_URI, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then( () => console.log(`Connected to the DataBase ${process.env.MONGODB_URI}`))
  .catch( (err) => console.log(err));


// EXPRESS SERVER INSTANCE
var app = express();


// CORS MIDDLEWARE SETUP
app.use(
  cors({
    credentials: true,
    origin: [process.env.PUBLIC_DOMAIN]
  })
)

// SESSION MIDDLEWARE
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 * 30 * 6, // 6 months
    }),
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    }
  })
)

// MIDDLEWARES
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// ROUTER MIDDLEWARES

app.use('/graphql', graphqlHTTP({ 
  // configuration of graphQL API
  schema: buildSchema(`
    type Task {
      _id: ID!
      title: String!
      description: String!
      date: String!
    }

    input TaskInput {
      title: String!
      description: String!
      date: String
    }

    type RootQuery {
      tasks: [Task!]!
    }

    type RootMutation {
      createTask(taskInput: TaskInput): Task 
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    } 
  `),
  rootValue: { 
    tasks: () => {
      return Task.find()
      .then(tasks => {
        return tasks.map(task => {
          return task;
        });
      })
      .catch(err => {
        throw err;
      })
    },
    createTask: args => {
      const task = new Task({
        title: args.taskInput.title,
        description: args.taskInput.description,
        date: new Date(args.taskInput.date),
      })
      return task.save()
      .then( newTask => {
        // console.log(newTask);
        return newTask;
      }).catch( err => {
        // console.log(err);
        throw err;
      }); 
      
    }
  },
  graphiql: true
}));


// ERROR HANDLING
// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: 'not found' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    const statusError = err.status || '500';
    res.status(statusError).json(err);
  }
});

module.exports = app;
