const express = require('express');
const db = require('./lib/db');

const app = express();
const port = process.env.PORT || 3000;

app.use('/app/current', require('./routes/current'));
app.use('/app/all', require('./routes/all'));
app.use('/app/sparkline', require('./routes/sparkline'));
app.use('/app/update', require('./routes/update'));

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500);
  res.send('kablooie!');
});

async function main() {
  db.startup()
    // eslint-disable-next-line no-console
    .catch(err => console.error(err.stack))
    .finally(() => app.listen(port));
}

main();
