import express from 'express';
import { startup } from './lib/db.mjs';

import current from './routes/current.mjs';
import all from './routes/all.mjs';
import sparkline from './routes/sparkline.mjs';
import update from './routes/update.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use('/app/current', current);
app.use('/app/all', all);
app.use('/app/sparkline', sparkline);
app.use('/app/update', update);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    next(err);
    return;
  }
  res.status(500);
  res.send('kablooie!');
});

async function main() {
  startup()
    .catch((err) => console.error(err.stack))
    .finally(() => app.listen(port));
}

main();
