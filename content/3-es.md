# Using ElasticSearch

## API
ElasticSearch is accessible via a REST API. Most operations on it are performed via various endpoints that this API provides.

### Creating index
`index` in ES is the top-level dataset that is used to store the entries. Creating a new one is as easy as calling:
`PUT /reddit-data`
However, we needed to provide some basic settings for the new index. We needed to provide datatypes of the fields of reddit entries. In ES it is done through index mappings. In our case the mappings were defined as follows:
```
mappings: {
  properties: {
    'name': { type: 'keyword' },
    'subreddit': { type: 'keyword' },
    'subreddit_id': { type: 'keyword' },
    'author': { type: 'keyword' },
    'edited': { type: 'text' },
    'controversiality': { type: 'integer' },
    'created_utc': { type: 'date' },
    'body': { type: 'text' },
    'ups': { type: 'integer' },
    'downs': { type: 'integer' },
    'score': { type: 'integer' },
    'parent_id': { type: 'keyword' },
    'archived': { type: 'text' },
  },
}
```
For each field we specified a type that was used to index the entries as we entered them into the database. 

#### `keyword` vs `text` type
The most important distinction we made in the types is the decision between `keyword` and `text` for the string fields. As ES learning source states:
```
The primary difference between the text datatype and the keyword datatype is that 
text fields are analyzed at the time of indexing, and keyword fields are not. What
that means is, text fields are broken down into their individual terms at 
indexing to allow for partial matching, while keyword fields are indexed as is.
```
If we used `keyword` type for `body` of each reddit comment, we would not be able to do efficient full-text search on the comments content and match single words or sets of words of it.

### Inserting the entries
The endpoint used to put a single entry into the index is:
`PUT /reddit_data/:entry_id`
(reddit_data is name of our index) The entry data is passed as a json in the request body, and then the entry is added and indexed in the index. However, we had to insert over 10 million of them, so doing it one by one was not an option. 

#### Bulk API
In order to insert a massive amount of entries, we had to use the `elasticdump` tool, that is in fact using the `Bulk API` of elasticsearch. It uses the following endpoint:
`POST reddit_data/_bulk`
And it passes newline-separated jsons as data. For inserting new entries, each line must be structured as follows:
`{ "create": {... entry data as json} }`
However, other operations are also allowed, including `update` and `delete`.

### Fetching the data
To query the data from elasticsearch we used the `_search` endpoint:
`GET reddit_data/_search`
We used it via `elasticsearch` npm library that is in fact a simple wrapper over the REST http client. We will be diving more into querying in the future sections. The basic structure of the query requires a `query` field in the json body. This field provides a query description that will be then used to search the dataset. For example, searching for `apple` in the body of reddit comments can be described as a following query:
```
query: {
  match: {
    body: 'apple'
  }
}
```
`match` operation performs a full-text search for the provided string in the `body` fields of the entries. This search is technically a `fuzzy` search, that means that the `body` field does not need to include literally `apple` string, but any string that is similiar. We will describe it in later on.
Another useful field is the `size`. It specifies what is the maximal number of entries that should be returned from elasticsearch in this single query. Default value is 20, so for better benchmarking we raised it to `5000` in all of the queries.

## Scoring
Scoring is the core concept of querying in elastic search. Each query gets an assigned score that is then used to order the returned entities respectively. ElasticSearch is built upon Lucene and it had a decisive impact on how the scoring mechanism works. Score is assigned to an entity with the Lucene's `Practical Scoring Function`:
```
score(q,d)  =  
            queryNorm(q)  
          · coord(q,d)    
          · ∑ (           
                tf(t in d)   
              · idf(t)²      
              · t.getBoost() 
              · norm(t,d)    
            ) (t in q)    
```
Where:
 - `score(q,d)` is the scoring function for document (entry) d and query q
 - `queryNorm` is the quotient used to normalize the query and is calculated as `queryNorm = 1 / √sumOfSquaredWeights`. Normalizing the query is the process that allows queries to work together despite different structure and different weights assigned to subqueries. 
 -  `coord` is the coordination factor. It denotes how big a part of the queried text was found in the entry fields.
 -  `tf` is the term frequency, meaning how many the queried term occured in the entry fields.
 - `idf` is the inverse document frequency. Its value says how often the searched term occurs in all the entries in the index. If the term is uncommon, the it should be rewarded.
 - `norm` is the `field length norm`, and that's basically saying how long the field in the document is. If a field is shorter, then it should be more rewarded that the match occured.
