const readline = require('readline');
const fs = require('fs');

const fields = ['name', 'subreddit', 'subreddit_id', 'author', 'edited', 'controversiality', 'created_utc', 'body', 'ups', 'downs', 'score', 'parent_id', 'archived'];
const mappings = {
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
  },
};

fs.writeFileSync('elastic-mapping.json', JSON.stringify(mappings) + '\n');

const readInterface = readline.createInterface({ 
  input: fs.createReadStream('dataset.json'),
});

const writeStream = fs.createWriteStream('elastic-dataset.json');

readInterface.on('line', line => {
  const json = JSON.parse(line);
  const transformed = Object.entries(json).reduce((result, [key, value]) => {
    if(fields.includes(key)) result[key] = value;
    return result;
  }, {});
  transformed['created_utc'] = Number(transformed['created_utc']) * 1000;

  writeStream.write(JSON.stringify(transformed) + '\n');
});

// curl -X PUT "localhost:9200/reddit_data?pretty" -H 'Content-Type:application/json' --data-binary @elastic-mapping.json
// npx elasticdump --input=elastic-dataset.json --output=http://localhost:9200/reddit_data --type=data --transform="doc._source=Object.assign({},doc)" --limit=10000