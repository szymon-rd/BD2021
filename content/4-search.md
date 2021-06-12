# Implementing and benchmarking complex searching

## Full-text search
Full-text searching features allow us to search for a specific term (or similiar ones) in the text content. In our case, we want to search for a given term (or terms) in the comments. In our application, we want to create a new endpoint that will allow us a full text search on the full set of entries:

```GET /search/textSearch?string=:searchString```
### Basic PostgresSQL approach
```
async function textSearchPsql(searchString) {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE body LIKE '%${searchString}%' LIMIT 5000`
  )).rows;
}
```
Above function uses basic `LIKE` syntax. This function was introduced by us in the `searchRepository`, and then accessed from views via services. However, that naive approach can't be used in the production. Firstly, it does not behave as we want it to. It only matches comments that include `searchString` literally inside of them. For example, given search string `i love bananas` and the comment body `i love all bananas` there would be no match, and that's not the behaviour we want. Secondly, the performance of this solution is very, very bad.

#### Benchmarks
| Search string | Returned entries (5000 limit) | Time    |
|---------------|-------------------------------|---------|
| bananas       | 5000                          | 24581ms |
| capybara      | 38                            | 33080ms |
| i love you    | 765                           | 24138ms |

### Elasticsearch approach
In contrast to the naïve PostgreSQL `LIKE` approach, the Elasticsearch gives us everything out of the box. The search is fuzzy, so query `i love bananas` would match `i lve bananas`. It treats the terms separately, so it will work easily for strings like `i love all bananas`. And last, but not the least, it's a lot faster.
```
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
```
Due to the response structure, we had to extract it using the `extractSearchBodies` function. The query is very simple and is the essence of what ES was designed to do.

#### Benchmarking
| Search string | Returned entries (5000 limit) | Time   |
|---------------|-------------------------------|--------|
| bananas       | 4757                          | 1264ms |
| capybara      | 40                            | 57ms   |
| i love you    | 5000                          | 2722ms |

We can see a massive level of performence improvement. In the case of terms that do not appear often (`capybara`) the performance difference is 3 orders of magnitude. We also see difference in number of returned entries. It is due to the algorithm of calculating `score` for the searched terms - entries are returned if the resulting score lands over a given threshold.

### PostgreSQL Text Search Vector
However, the approach we used in PostgreSQL is too naive. There is a feature for full text search in PostgreSQL and to make a fair comparasion we will implement it as well. Fast full-text searches in PostgreSQL are based on text search vectors (tsvector) that store the text fields as vectors of terms that is then stored in sorted form allowing fast traversal. 

As a first step we have to create a GIN for `body` tsvectors index (in order to have the tsvectors prepared before requests):
```
CREATE INDEX body_tsv_index ON reddit_data
    USING gin(to_tsvector('simple',body));
```
First observation is that this operation was very slow. It took over 20 minutes to complete, but now we can write an efficient full-text search query using postgresql:
```
async function textSearchPsqlTsv(searchString) {
  return await (await pool.query(
    `SELECT * FROM reddit_data 
      WHERE to_tsvector('simple', body) @@ to_tsquery('''${searchString}''')
      LIMIT 5000`
    )).rows;
}
```
`@@` operator executes a given query on a tsvector. Above code will search for the `searchString` in the tsvectors created for `body` fields.

#### Benchmarking
| Search string | Returned entries (5000 limit) | Time  |
|---------------|-------------------------------|-------|
| bananas       | 4726                          | 726ms |
| capybara      | 40                            | 20ms  |
| i love you    | 5000                          | 352ms |
The PostgreSQL TSV is the fastest approach. However, we think that there is an important reason to it being so fast - it's just much simpler than the ElasticSearch scoring. It still does not fullfill all of our expectations - it just checks if the given terms are included in the text search vectors. ElasticSearch model would still give us results that would help us build much better full-text search function to offer to the app's users. And it's also much simpler in terms of the written code and preparations.

## Custom regex search

TODO