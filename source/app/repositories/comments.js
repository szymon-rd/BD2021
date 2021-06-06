const { Pool } = require('pg')

const pool = new Pool({
  user: 'reddit',
  host: 'localhost',
  database: 'reddit',
  password: '',
  port: 5432,
});

async function fetchComments(limit = 20) {
  return await (await pool.query(`SELECT * FROM reddit_data ORDER BY created_utc DESC LIMIT ${limit}`)).rows;
}

async function fetchCommentsForThread(threadId, limit = 20) {
  return await (await pool.query(`SELECT * FROM reddit_data WHERE parent_id=${threadId} ORDER BY created_utc DESC LIMIT ${limit}`)).rows;
}

module.exports = {fetchComments, fetchCommentsForThread};