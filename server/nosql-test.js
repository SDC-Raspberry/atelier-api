const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  const kittySchema = new mongoose.Schema({
    name: String
  });
  const Cat = mongoose.model('Cat', kittySchema);

  const kitty = new Cat({ name: 'Zildjian' });
  console.log(kitty.name);
  kitty.save()
    .then(() => console.log('meow'));
});