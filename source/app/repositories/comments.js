const uuid = require("uuid");
const db = require("./db");

const pool = db.pool;

async function fetchTopComments(limit, offset) {
  return await (await pool.query(`SELECT * FROM reddit_data ORDER BY ups DESC LIMIT ${limit} OFFSET ${offset}`)).rows;
}

async function fetchComment(threadId) {
  return await (await pool.query(`SELECT * FROM reddit_data WHERE name='${threadId}'`)).rows;
}

async function fetchCommentsForThread(threadId, limit = 20) {
  return await (await pool.query(`SELECT * FROM reddit_data WHERE parent_id='${threadId}' ORDER BY ups DESC LIMIT ${limit}`)).rows;
}

async function persistComment(subreddit, author, createdAt, body, ups, parentId) {
  let randomId = uuid.v4().replace('-', '');
  await pool.query(`INSERT INTO reddit_data 
    (name, subreddit, subreddit_id, author, edited, controversiality, created_utc, body, ups, downs, score, parent_id, archived) 
    VALUES ('${randomId}', '${subreddit}', '${subreddit}', '${author}', 'false', '0', '${createdAt}', '${body}', '${ups}', 0, '${ups}', '${parentId}', 'false')
  `)
  console.log("inserted")
}
 
module.exports = {fetchTopComments, fetchCommentsForThread, fetchComment, persistComment};
