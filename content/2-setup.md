# Setup
As a first step, we need to set up our environment.

## Importing the data and setup
### Installation (macOS)
The first step is installation of ES stack and postgres databases.
```
 > brew install elastic/tap/elasticsearch-full
 > brew install elastic/tap/kibana-full
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
#### Postgresql
Now, we have to import all the required data. We created an utility app at the [dataimport/postgresql](../source/data_import/postgresql) source directory. In order to run it, there has to be a `dataset.json` file in the project root directory. It creates a necessary table to store the data, and then exports the data to csv. Then, the data can be imported with data import utility tool in DataGrip. 


#### Elasticsearch 
In order to import data to the elasticsearch we created a utility app available at [dataimport/elasticsearch](../source/data_import/elasticsearch) source directory. After running it, it will produce files containing fields mapping and prepared dataset for elasticsearch. In order to import them to the running database, the following commands must be run:
```
curl -X PUT "localhost:9200/reddit_data?pretty" -H 'Content-Type:application/json' 
    --data-binary @elastic-mapping.json

npx elasticdump --input=elastic-dataset.json --output=http://localhost:9200/reddit_data 
    --type=data --transform="doc._source=Object.assign({},doc)" --limit=10000
```



