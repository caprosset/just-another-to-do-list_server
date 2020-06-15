const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Task {
      _id: ID!
      title: String!
      description: String!
      deadline: String!
      taskCategory: String!
      creator: User!
      completed: Boolean!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdTasks: [Task!]
      completedTasks: [Task!]
    }

    input TaskInput {
      title: String!
      description: String!
      deadline: String!
      taskCategory: String!
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