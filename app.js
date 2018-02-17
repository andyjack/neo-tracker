const express = require('express');
const db = require('./lib/db');

const app = express();
const port = process.env.PORT || 3000;

process.env.PATH = `${process.env.PATH}:./node_modules/.bin`;

app.use('/app/current', require('./routes/current'));
app.use('/app/sparkline', require('./routes/sparkline'));
app.use('/app/update', require('./routes/update'));
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('kablooie!')
})

async function main() {
  db.startup()
  .catch( err => console.error(err.stack)  )
  .finally( () => app.listen(port) );
}

main();
