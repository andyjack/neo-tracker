import { startup, sqlite } from '../lib/db.mjs';

startup()
  .then(() => sqlite().migrate())
  // eslint-disable-next-line no-console
  .catch((err) => console.log(err));
