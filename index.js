require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('type', (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.method(req, res) === 'POST' ? JSON.stringify(req.body) : ''
  ].join(' ')
})

app.use(morgan('type'))
app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/', (request, response) =>
  response.send('<h1>Hello World!</h1>')
)

app.get('/info', (request, response) => {
  const length = persons.length
  const now = new Date()
  response.send(`<p>Phonebook has info for ${length} people</p><p>${now}</p>`)
})

app.get('/api/persons', (request, response, next) =>
  Person.find({})
    .then(persons => response.json(persons))
    .catch(error => next(error))
)

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  person ?
    response.json(person)
    : response.status(404).json({ error: `Person ${id} not found` })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  const person = new Person({
    name: body.name,
    number: body.number
  })
  if (!person.name || !person.number) return response.status(400).json({ error: 'Name or number missing' })

  // const duplicate = persons.find(p => p.name.toLocaleLowerCase() === person.name.toLocaleLowerCase())
  // if (duplicate) return response.status(400).json({ error: `Person ${person.name} exists` })

  persons = persons.concat(person)
  person.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))