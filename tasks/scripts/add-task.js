const tasks = require('../tasks.json');

module.exports = ({github, context}) => {
  const issue = context.payload.issue;
  console.log({issue});
}
