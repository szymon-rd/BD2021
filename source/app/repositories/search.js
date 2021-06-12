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

async function regexSearchPsql(regex) {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE body ~ '${regex}'
      LIMIT 5000`
    )).rows;
}

async function regexSearchElastic(regex) {
  const { body } = await esClient.search({
    index: 'reddit_data',
    size: 5000,
    body: {
      query: {
        regexp: {
          body: {
            value: regex,
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

async function weightedSearchElastic(searchString) {
  const { body } = await esClient.search({
    index: 'reddit_data',
    size: 5000,
    body: {
      query: {
        query_string: {
          query: searchString,
          fields: [
            "author^10.0",
            "body^4.0",
            "reddit^2.0"
          ]
        }
      }
    }
  })
  return extractSearchBodies(body.hits.hits);
}

async function weightedSearchPsqlTsv(searchString) {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE tsv @@ to_tsquery('${searchString}')
      LIMIT 5000`
    )).rows;
}

async function recentSearchElastic(date, searchString) {
  const { body } = await esClient.search({
    index: 'reddit_data',
    size: 5000,
    body: {
      query: {
        function_score: {
          query: {match_all: {}},
          functions: [
            {
              gauss: {
                created_utc: {
                  origin: date,
                  scale: "10d",
                  decay: 0.5,
                  offset: "5d"
                }
              },
            }
          ],
          score_mode: "multiply",
          query: {
            match: { body: searchString },
          }
        }
      }
    }
  })
  return extractSearchBodies(body.hits.hits);
}

module.exports = {textSearchElastic, textSearchPsql, textSearchPsqlTsv, regexSearchPsql, regexSearchElastic, weightedSearchElastic, weightedSearchPsqlTsv, recentSearchElastic};