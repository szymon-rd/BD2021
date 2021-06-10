const { Pool } = require('pg')

const pool = new Pool({
  user: 'reddit',
  host: 'localhost',
  database: 'reddit',
  password: '',
  port: 5432,
});

module.exports = {pool};