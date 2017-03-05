const express = require('express');
const db = require('./lib/db');

const app = express();
const port = process.env.PORT || 3000;

process.env.PATH = `${process.env.PATH}:./node_modules/.bin`;

app.use('/current', require('./routes/current'));
app.use('/sparkline', require('./routes/sparkline'));
app.use('/update', require('./routes/update'));

async function main() {
  db.startup()
  .catch( err => console.error(err.stack)  )
  .finally( () => app.listen(port) );
}

main();
