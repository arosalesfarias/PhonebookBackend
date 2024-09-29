const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', (request, response, next) =>
    Person.find({})
        .then(persons => response.json(persons))
        .catch(error => next(error))
)

personsRouter.get('/:id', (request, response, next) => {
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

personsRouter.delete('/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => response.status(204).end())
        .catch(error => next(error))
})

personsRouter.post('/', (request, response, next) => {
    const body = request.body
    const person = new Person({
        name: body.name,
        number: body.number
    })
    if (!person.name || !person.number) return response.status(400).json({ error: 'Name or number missing' })

    // const duplicate = persons.find(p => p.name.toLocaleLowerCase() === person.name.toLocaleLowerCase())
    // if (duplicate) return response.status(400).json({ error: `Person ${person.name} exists` })

    //persons = persons.concat(person)
    person.save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error))
})

personsRouter.put('/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatePerson => response.json(updatePerson))
        .catch(error => next(error))
})

module.exports = personsRouter