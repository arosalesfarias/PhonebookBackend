const express = require('express')
const app = express()
app.use(express.json())

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

app.get('/info', (request, response) =>{
    const length = persons.length
    const now = new Date()
    response.send(`<p>Phonebook has info for ${length} people</p><p>${now}</p>`)
})

app.get('/api/persons', (request, response) =>
    response.json(persons)
)

app.get('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    const person = persons.find( p => p.id === id)
    person?
        response.json(person)
        :response.status(404).json({error:`Person ${id} not found`})
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
    name: body.name
  }
  persons = persons.concat(person)

  response.json(person)
})

const PORT = 3001
app.listen( PORT, () => console.log(`Server running on port ${PORT}`))