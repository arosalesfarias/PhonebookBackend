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

app.get('/', (request, response) =>
  response.send('<h1>Hello World!</h1>')
)

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      const length = persons.length
      const now = new Date()
      response.send(`<p>Phonebook has info for ${length} people</p><p>${now}</p>`)
    })
    .catch(error => next(error))

})

app.get('/api/persons', (request, response, next) =>
  Person.find({})
    .then(persons => response.json(persons))
    .catch(error => next(error))
)

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).json({ error: `Person ${request.params.id} not found` })
      }
    })
    .catch(error => next(error))
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

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatePerson => response.json(updatePerson))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))