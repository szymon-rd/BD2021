const uuid = require("uuid");
const db = require("./db");
const es = require("./elastic");
const pool = db.pool;
const esClient = es.client

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
  await esClient.index({
    index: 'reddit_data',
    id: randomId,
    body: {
      name: randomId,
      subreddit: subreddit,
      subreddit_id: subreddit,
      author: author,
      edited: false,
      controversiality: 0,
      createdAt: createdAt,
      ups: ups,
      downs: 0,
      score: ups,
      parentId: parentId,
      archived: false
    }
  })
  console.log("inserted")
}
 
module.exports = {fetchTopComments, fetchCommentsForThread, fetchComment, persistComment};
