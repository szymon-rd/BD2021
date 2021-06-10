const db = require("./db");
const elastic = require("./elastic");

const pool = db.pool;
const esClient = elastic.client;

async function textSearchPsql(searchString) {
  return await (await pool.query(`SELECT * FROM reddit_data WHERE body LIKE '%${searchString}%' LIMIT 5000`)).rows;
}

async function textSearchPsqlTsv(searchString) {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE to_tsvector('simple', body) @@ to_tsquery('${searchString}')
      LIMIT 5000`
    )).rows;
}

function extractSearchBodies(hits) {
  return hits.map(extractSearchBody);
}

function extractSearchBody(hit) {
  return hit._source
}
async function textSearchElastic(searchString) {
  const { body } = await esClient.search({
    index: 'reddit_data',
    size: 5000,
    body: {
      query: {
        match: {
          body: searchString
        }
      }
    }
  })
  return extractSearchBodies(body.hits.hits);
}

async function coordinatesSearchPsql() {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE body ~ '.*([-+]?)([\d]{1,2})(((\.)([\d]{2,10})(,)))(\s*)(([-+]?)([\d]{1,3})((\.)([\d]{2,10}))?).*'
      LIMIT 5000`
    )).rows;
}

async function coordinatesSearchElastic() {
  const { body } = await esClient.search({
    index: 'reddit_data',
    size: 5000,
    body: {
      query: {
        regexp: {
          body: {
            value: '.*([-+]?)([\d]{1,2})(((\.)([\d]{2,10})(,)))(\s*)(([-+]?)([\d]{1,3})((\.)([\d]{2,10}))?).*',
            flags: 'ALL',
            case_insensitive: true,
            max_determinized_states: 10000,
            rewrite: 'constant_score'
          }
        }
      }
    }
  })
  return extractSearchBodies(body.hits.hits);
}

module.exports = {textSearchElastic, textSearchPsql, textSearchPsqlTsv, coordinatesSearchElastic, coordinatesSearchPsql};