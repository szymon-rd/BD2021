const { client: esClient } = require("./elastic");
const { pool } = require("./db");

async function textSearchPsql(searchString) {
  const { rows } = await pool.query(
    `SELECT * FROM reddit_data WHERE body LIKE '%${searchString}%' LIMIT 5000`
  );
  return rows;
}

async function textSearchPsqlTsv(searchString) {
  const { rows } = await pool.query(
    `SELECT * FROM reddit_data 
      WHERE to_tsvector('simple', body) @@ to_tsquery('''${searchString}''')
      LIMIT 5000`
  );
  return rows; 
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
  const { rows } = await pool.query(
    `SELECT * FROM reddit_data 
      WHERE body ~ '${regex}'
      LIMIT 5000`
  );
  return rows;
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
            "subreddit^2.0"
          ]
        }
      }
    }
  })
  return extractSearchBodies(body.hits.hits);
}

async function weightedSearchPsqlTsv(searchString) {
  const { rows } = await pool.query(
    `SELECT *, ts_rank_cd(tsv, query) AS rank
      FROM reddit_data, to_tsquery('''${searchString}''') query
      WHERE query @@ tsv
      ORDER BY rank DESC
      LIMIT 5000`
  );
  return rows;
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
                  offset: "2d"
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

module.exports = { textSearchElastic, textSearchPsql, textSearchPsqlTsv, regexSearchPsql, regexSearchElastic, weightedSearchElastic, weightedSearchPsqlTsv, recentSearchElastic };