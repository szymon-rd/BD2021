# Elasticsearch
Elasticsearch is an analytics engine that supports querying multiple types of data. It's distributed, free and opensource. It uses *Apache Lucene* internally as a search engine. It's accessible via REST API and is provided with a set of tools branded as Elastic Stack, with most popular of them being Logstash and Kibana.

## Limitations of elasticsearch
Despite its adventages in querying performance and convenience, elasticsearch is not a great choice as an only database for real-life, business application. It does not feature transactions nor rollbacks. It's not real-time, that means that the data may be available even after over 1 second. Elasticsearch also may lose data in some scenarios. Therefore, every team introducing elasticsearch to their stack must be aware of these limitations and address them thoroughly.

## The project idea
During this project, we intend to compare Elasticsearch capabilities and performance to other databases, and most importantly - show how to make these databases work together with ElasticSearch. The approach we will use is often described as data redundancy. That means that we will be persisting data both in a database more suited for safe persistence, and in the elasticsearch.
