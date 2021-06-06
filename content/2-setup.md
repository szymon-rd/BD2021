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

