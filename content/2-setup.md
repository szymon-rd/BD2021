# Setup
We will be using kibana as monitoring and data visualisation tool for ElasticSearch. 

## Importing the data and setup
### Installation (macOS)
The first step is installation of ES stack and postgres databases.
```
 > brew install elastic/tap/kibana-full
 > brew install elastic/tap/elasticsearch-full
 > brew install postgresql 
```

### Starting the databases
The following commands can be used to run the databases:
```
 > elasticsearch
 > kibana
 > initdb -D postgres
 > postgres -D postgres
```

### Feeding the databases with data


### Indices used on PSQL
```
CREATE INDEX top_index
    ON reddit_data (ups);

CREATE INDEX name_index
    ON reddit_data (name);

CREATE INDEX body_index
    ON reddit_data (body); /* fails */


CREATE INDEX body_tsv_index ON reddit_data
    USING gin(to_tsvector('simple',body));

ALTER TABLE reddit_data ADD COLUMN tsv tsvector;

UPDATE reddit_data SET tsv =
    setweight(to_tsvector(author), 'A') ||
    setweight(to_tsvector(body), 'B') ||
    setweight(to_tsvector(subreddit), 'C');


```

note:
[54000] word is too long to be indexed