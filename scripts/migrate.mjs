import { startup, sqlite } from '../lib/db.mjs';

startup()
  .then(() => sqlite().migrate())

  .catch((err) => console.log(err));
