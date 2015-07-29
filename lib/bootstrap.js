import { createPool } from './db';

import SimpleAnalytics from './analytics/simple';

import config from '../.config';


async function bootstrap() {

  var pool = createPool(config.db);

  var connection;

  try {

    connection = await pool.getConnection();

    var analytics = new SimpleAnalytics(connection);

    await analytics.analyse();

    analytics.printResults();

  } finally {
    if (connection) {
      connection.release();
    }
  }

  await pool.end();
}


// do bootstrap!
bootstrap().catch(function(e) {
  console.error('ERROR: Failed to bootstrap');
  console.error(e);
});