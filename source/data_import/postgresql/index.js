const { Pool } = require('pg')
const readline = require('readline');
const fs = require('fs');

// createuser reddit
// psql CLI: ALTER ROLE reddit CREATEDB;
// createdb reddit -U reddit

const pool = new Pool({
  user: 'reddit',
  host: 'localhost',
  database: 'reddit',
  password: '',
  port: 5432,
});

const readInterface = readline.createInterface({ 
  input: fs.createReadStream('../../../dataset.json'),
});

const writeStream = fs.createWriteStream('postgres-dataset.csv');

async function createTable() {
  await pool.query(`CREATE TABLE if not exists reddit_data (
    name text,
    subreddit text,
    subreddit_id text,
    author text,
    edited text,
    controversiality text,
    created_utc text,
    body text,
    ups integer,
    downs integer,
    score integer,
    parent_id text,
    archived text
  );`);
}

async function insertLine(line) {
  const json = JSON.parse(line);

  const row = [
    json.name,
    json.subreddit,
    json.subreddit_id,
    json.author,
    json.edited,
    json.controversiality,
    Number(json.created_utc) * 1000,
    json.body,
    json.ups,
    json.downs,
    json.score,
    json.parent_id,
    json.archived,
  ].map(field => {
    if(field === null) return '""';
    return `"${field.toString().replaceAll('"', '""')}"`;
  }).join(',');

  writeStream.write(row + '\n');
}

(async() => {
  await createTable();
  readInterface.on('line', insertLine);
})();
