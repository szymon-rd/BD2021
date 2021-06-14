const uuid = require("uuid");
const { client: esClient } = require("./elastic");
const { pool } = require("./db");

async function fetchTopComments(limit, offset) {
  const { rows } = await pool.query(`SELECT * FROM reddit_data ORDER BY ups DESC LIMIT ${limit} OFFSET ${offset}`);
  return rows;
}

async function fetchComment(threadId) {
  const { rows } = await pool.query(`SELECT * FROM reddit_data WHERE name='${threadId}'`);
  return rows;
}

async function fetchCommentsForThread(threadId, limit = 20) {
  const { rows } = await pool.query(`SELECT * FROM reddit_data WHERE parent_id='${threadId}' ORDER BY ups DESC LIMIT ${limit}`);
  return rows;
}

async function persistComment(subreddit, author, createdAt, body, ups, parentId) {
  const randomId = uuid.v4().replace('-', '');
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
  });
}
 
module.exports = { fetchTopComments, fetchCommentsForThread, fetchComment, persistComment };
