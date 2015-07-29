import mysql from 'mysql';
import { bind, denodeify } from '../helper/fn';


function promisifyPool(pool) {
  return new Pool(pool);
}

function promisifyConnection(connection) {
  return new Connection(connection);
}


export class Pool {

  constructor(pool) {

    this.$p = pool;

    // API
    this.getConnection = denodeify(pool, 'getConnection', promisifyConnection);
    this.end = denodeify(pool, 'end');
  }

}

export class Connection {

  constructor(connection) {

    this.$c = connection;

    // API
    this.query = denodeify(connection, 'query');
    this.ping = denodeify(connection, 'ping');

    this.beginTransaction = denodeify(connection, 'beginTransaction');
    this.rollback = denodeify(connection, 'rollback');
    this.commit = denodeify(connection, 'commit');

    this.release = bind(connection, 'release');
  }

}


export function createPool(config) {
  return promisifyPool(mysql.createPool(config));
}