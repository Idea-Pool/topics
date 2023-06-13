const tasks = require('../config/tasks.json');

function processTaskList(issue, body, taskList) {
  if (!issue.labels.find(label => label.name === taskList.label)) {
    console.log("No match");
    return body;
  }
  const START_TOKEN = `<!-- start:task-list:${taskList.id} -->`;
  const END_TOKEN = `<!-- end:task-list:${taskList.id} -->`;
  if (body.includes(START_TOKEN)) {
    console.log("Task list already added");
    return body;
  }
  console.log("Adding task list");
  const tasks = taskList.tasks.map(item => {
    item = item.replace(/@Assignee/gi, issue.assignee ? `@${issue.assignee.login}` : "TBD");
    return `- [ ] ${item}`;
  })
  return [
    body,
    "",
    START_TOKEN,
    "## " + (taskList.title || `Tasks (${taskList.id})`),
    "",
    ...tasks,
    END_TOKEN,
  ].join("\r\n");
}

module.exports = async ({github, context}) => {
  const activeTaskLists = Object.keys(tasks)
    .filter(id => tasks[id].enabled)
    .map(id => ({ ...tasks[id], id }));
  
  const issue = context.payload.issue;
  let body = issue.body;
  
  for (const taskList of activeTaskLists) {
    console.log("Processing task list:", taskList.id);
    body = processTaskList(issue, body, taskList);
  }
  
  if (body !== issue.body) {
    console.log("Updating issue");
    const params = {
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body,
    };
    return await github.rest.issues.update(params);
  } else {
    console.log("No change");
  }
}
