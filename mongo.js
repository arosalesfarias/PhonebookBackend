const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('missing arguments')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://arosalesfarias:${password}@fullstackopen.bs9jw5m.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=FullStackOpen`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length<5) {
  Person.find({}).then(res => {
    console.log('phonebook:')
    res.forEach( person => console.log(person.name,person.number))
    mongoose.connection.close()
  })
}else{
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}