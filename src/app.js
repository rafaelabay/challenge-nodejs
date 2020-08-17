const express = require("express");
const cors = require("cors");
const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next) {
  const { method, url} = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`
  
  console.time(logLabel);

  next();
  //dispara o próximo middleware
  console.timeEnd(logLabel);

}

function validateRepositoryId (request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({error: 'Invalid repository ID'})
  }

  return next();
}

app.use(logRequest);
app.use('/repository/:id', validateRepositoryId)


app.get("/repositories", (request, response) => {
  // 
  const {title} = request.query;

  const results = title
  ? repositories.filter(repository => repository.title.includes(title))
  : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  // Test OK
  const { title, url, techs } = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0 };
  repositories.push(repository);


  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  // Test OK
  const {id} = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  const repository = {
    id,
    title,
    url,
    techs,
    likes : repositories[repositoryIndex].likes
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  // Test OK
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  // Test OK

  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id == id);
  if (repositoryIndex < 0) {
    return response.status(400).json({error: 'repository not found'})
  }

  //repositories é um array = repositoryIndex tem a posição do elemento que eu estou buscando o ID
  const repository = repositories[repositoryIndex];
  repository.likes = repository.likes + 1;

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

module.exports = app;
