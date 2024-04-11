require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

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

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

app.get('/', (request, response) =>
  response.send('<h1>Hello World!</h1>')
)

app.get('/info', (request, response) => {
  const length = persons.length
  const now = new Date()
  response.send(`<p>Phonebook has info for ${length} people</p><p>${now}</p>`)
})

app.get('/api/persons', (request, response) =>
  Person.find({}).then(persons => {
    response.json(persons)
  })
)

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  person ?
    response.json(person)
    : response.status(404).json({ error: `Person ${id} not found` })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const min = Math.ceil(1);
  const max = Math.floor(10000000);
  return Math.floor(Math.random() * (max - min) + min)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  if (!person.name || !person.number) return response.status(400).json({ error: 'Name or number missing' })

  const duplicate = persons.find(p => p.name.toLocaleLowerCase() === person.name.toLocaleLowerCase())
  if (duplicate) return response.status(400).json({ error: `Person ${person.name} exists` })

  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))