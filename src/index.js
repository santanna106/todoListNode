const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
      return response.status(404).json({error:"User not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name,username } = request.body;
  

  const user = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }

  const userFound = users.find(user => user.username === username);

  if(userFound){
    return response.status(400).json({error: "User Already registered"});
  } else {

    users.push(user);

    return response.status(201).json(user);
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
   const { user } = request;
 

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title,deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline:new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);
  response.status(201).json(todo);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { deadline,title} = request.body;
  const { user } = request;

  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound){
    response.status(404).json({error:"Todo not found"});
  }

  const todos = user.todos.map(todo => {
    if(todo.id === id){
      todo.deadline = new Date(deadline);
      todo.title = title
    }

    return todo;
  });

  user.todos = todos;
  const todoUpdate = user.todos.find(todo => todo.id === id);
  response.status(201).json(todoUpdate);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;


  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound){
    response.status(404).json({error:"Todo not found"});
  }

  
  const todos = user.todos.map(todo => {
    if(todo.id === id){
      todo.done = true;
    }
    return todo;
  });
  
  user.todos = todos;
  
  const todoFoundDone = user.todos.find(todo => todo.id === id);
  response.status(201).json(todoFoundDone);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  if(user.todos.length > 0){

    const todoFound = user.todos.find(todo => todo.id === id);

    if(!todoFound){
      response.status(404).json({error:"Todo not found"});
    }
  
    
    const todos = user.todos.filter(todo => todo.id !== id);

    
    
    user.todos = todos;
   
    response.status(204).json();

  } else {
    response.status(404).json({error:"Todo not found"});
  }
 
});

module.exports = app;