# Elasticsearch
Elasticsearch (ES) is an analytics engine that supports querying multiple types of data. It's distributed, free and opensource. It uses *Apache Lucene* internally as a search engine. It's accessible via REST API and is provided with a set of tools branded as Elastic Stack, with most popular of them being Logstash and Kibana. And most importantly, it was designed to reduce costs of performing queries and data-analysis tasks on big sets of data - both the infrastructural cost and the 

## Limitations of elasticsearch
Despite its adventages in querying performance and convenience, elasticsearch is not a great choice as an only database for real-life, business application. It does not feature transactions nor rollbacks. It's not real-time, that means that the data may be available even after over 1 second. Elasticsearch also may lose its data in some scenarios. Therefore, every team introducing elasticsearch to their stack must be aware of these limitations and address them thoroughly. ES is not an ACID database and should not be treated as such, meaning no business logic requiring consistency and security should be built solely upon it.

## The project idea
During this project, we intend show how to make a relational database (postgresql) work together with ElasticSearch. The approach we will use is often described as data redundancy. That means that we will be persisting data both in a database more suited for safe persistence, and in the elasticsearch.  
We will be working on the example app in the [app](../source/app) source folder. We plan to focus on the process of introducing advanced search and data-analysis features to a very basic reddit-like website. In the process of benchmarking and implementing the features, we used [this reddit comments dataset](https://files.pushshift.io/reddit/comments/) that provided us with 10 million data entries.

## The application
The application that we will be creating is a very basic reddit-like website..

```
CREATE INDEX top_index
    ON reddit_data (ups);

CREATE INDEX name_index
    ON reddit_data (name);

CREATE INDEX parent_index
    ON reddit_data (parent_id, created_utc);
```