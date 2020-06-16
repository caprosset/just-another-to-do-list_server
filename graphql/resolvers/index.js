const authResolver = require('./auth');
const tasksResolver = require('./tasks');

const RootResolver = {
  ...authResolver,
  ...tasksResolver
};

module.exports = RootResolver;