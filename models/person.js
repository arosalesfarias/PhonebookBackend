require('dotenv').config()
const mongoose = require('mongoose')

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
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate : {
      validator: value => /\d{2,3}-\d{4}/.test(value),
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'Person phone number required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// const User = mongoose.model('Person', personSchema);
// const user = new User();
// let error;

// user.name = 'Ariel'
// user.phone = '555.0123';
// error = user.validateSync();
// assert.equal(error.errors['phone'].message,
//   '555.0123 is not a valid phone number!');

// user.phone = '';
// error = user.validateSync();
// assert.equal(error.errors['phone'].message,
//   'User phone number required');

// user.phone = '201-555-0123';
// // Validation succeeds! Phone number is defined
// // and fits `DDD-DDD-DDDD`
// error = user.validateSync();
// assert.equal(error, null);

module.exports = mongoose.model('Person', personSchema)