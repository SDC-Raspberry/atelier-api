const assert = require('chai').assert;

// connect to the test db
const mongoose = require("mongoose");
const dbName = "atelier-test";

// define all the schemas
const personSchema = new mongoose.Schema({
  name: String,
  age: Number
});

const Person = new mongoose.model("person", personSchema);

describe("Query Tests", () => {
  before((done) => {
    mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function() {
      console.log('DB: ' + db.name + ' local: ' + db.host + ':' + db.port);
      done();
    });
  });

  // for each query
  describe('Query A', () => {
    // before the tests
    before((done) => {
      // delete contents of that table
      const personMockData = [
        {
          name: 'Keegan',
          age: 9,
        },
        {
          name: 'Shany',
          age: 64,
        }
      ];

      Person.deleteMany({})
        .then(result => {
          Person.collection.insertMany(personMockData);
          done();
        });
    });

    // do all the query tests
    it('should find an entry in the db', () => {
      const query = Person.find({ name: 'Keegan' });
      return query.lean().exec()
        .then(result => {
          assert.lengthOf(result, 1);
          assert.propertyVal(result[0], 'name', 'Keegan');
          assert.propertyVal(result[0], 'age', 9);
        });
    });

    after((done) => {
      mongoose.disconnect();
      done();
    });
  });
});
