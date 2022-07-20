const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArray = ["WORK", "HOME", "LEARNING"];

var hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

var hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

var hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

var hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

var hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

var hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

///API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", category, priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priorityArray.includes(priority) && statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        if (priorityArray.includes(priority)) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          if (statusArray.includes(status)) {
            response.status(400);
            response.send("Invalid Todo Priority");
          }
        }
      }
      break;

    case hasCategoryAndStatusProperties(request.query):
      if (categoryArray.includes(category) && statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
      } else {
        if (categoryArray.includes(category)) {
          response.status(400);
          response.send("Invalid Todo Status");
          break;
        } else {
          if (statusArray.includes(status)) {
            response.status(400);
            response.send("Invalid Todo Category");
            break;
          }
        }
      }

    case hasCategoryAndPriorityProperties(request.query):
      if (
        priorityArray.includes(priority) &&
        categoryArray.includes(category)
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
        break;
      } else {
        if (priorityArray.includes(priority)) {
          response.status(400);
          response.send("Invalid Todo category");
          break;
        } else {
          if (categoryArray.includes(category)) {
            response.status(400);
            response.send("Invalid Todo Priority");
            break;
          }
        }
      }

    case hasPriorityProperty(request.query):
      if (priorityArray.includes(priority)) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
        break;
      }

    case hasStatusProperty(request.query):
      if (statusArray.includes(status)) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
        break;
      }

    case hasCategoryProperty(request.query):
      if (categoryArray.includes(category)) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data);
        break;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
        break;
      }

    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      data = await database.all(getTodosQuery);
      response.send(data);
  }
});

///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});
///API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dueDate = date;

  let month = parseInt(dueDate.split("-")[1]);
  let day = parseInt(dueDate.split("-")[2]);
  let year = dueDate.split("-")[0];
  if (month < 10) {
    month = 0 + month.toString();
  }
  if (day < 10) {
    day = 0 + day.toString();
  }
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  let isDateValid = isValid(new Date(`${year}-${month}-${day}`));

  if (isDateValid) {
    let month = parseInt(date.split("-")[1]);
    let day = parseInt(date.split("-")[2]);
    let year = date.split("-")[0];
    if (month < 10) {
      month = 0 + month.toString();
    }
    if (day < 10) {
      day = 0 + day.toString();
    }

    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      strftime('%Y', due_date) = '${year}'
       AND strftime('%m', due_date) = '${month}'
  AND strftime('%d', due_date) = '${day}'
 `;
    const todo = await database.all(getTodoQuery);
    response.send(todo);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
///API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  /// for validating date
  let month = parseInt(dueDate.split("-")[1]);
  let day = parseInt(dueDate.split("-")[2]);
  let year = dueDate.split("-")[0];
  if (month < 10) {
    month = 0 + month.toString();
  }
  if (day < 10) {
    day = 0 + day.toString();
  }
  day = parseInt(day);
  month = parseInt(month);
  year = parseInt(year);

  let isDateValid = isValid(new Date(`${year}-${month}-${day}`));

  if (
    priorityArray.includes(priority) &&
    categoryArray.includes(category) &&
    status.includes(status) &&
    isDateValid
  ) {
    let month = parseInt(dueDate.split("-")[1]);
    let day = parseInt(dueDate.split("-")[2]);
    let year = dueDate.split("-")[0];
    if (month < 10) {
      month = 0 + month.toString();
    }
    if (day < 10) {
      day = 0 + day.toString();
    }

    let createDateObj = format(new Date(year, month - 1, day), "yyyy-MM-dd");
    console.log(createDateObj);

    const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}','${category}','${createDateObj}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  } else {
    if (
      priorityArray.includes(priority) === true &&
      categoryArray.includes(category) === true &&
      isDateValid === true &&
      statusArray.includes(status) === false
    ) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
    if (
      priorityArray.includes(priority) === true &&
      isDateValid === true &&
      categoryArray.includes(category) === false &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
    if (
      priorityArray.includes(priority) === false &&
      isDateValid === true &&
      categoryArray.includes(category) === true &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
    if (
      priorityArray.includes(priority) === true &&
      isDateValid === false &&
      categoryArray.includes(category) === true &&
      statusArray.includes(status) === true
    ) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});
///API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "due_date";
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
