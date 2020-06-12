const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Task {
      _id: ID!
      title: String!
      description: String!
      date: String!
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdTasks: [Task!]
    }

    input TaskInput {
      title: String!
      description: String!
      date: String
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      tasks: [Task!]!
      users: [User!]!
    }

    type RootMutation {
      createTask(taskInput: TaskInput): Task 
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    } 
  `)