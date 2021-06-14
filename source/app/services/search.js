const searchRepository = require('../repositories/search');

function mapToViews(comments) {
  return comments.map(mapToView);
}

function mapToView(comment) {
  return {
    id: comment.name,
    author: comment.author, 
    created_at: new Date(parseInt(comment.created_utc)).toUTCString(), 
    body: comment.body,
    ups: comment.ups,
    downs: comment.downs,
    subreddit: comment.subreddit
  }
}

async function textSearch(mode, searchString) {
  const search = { 
    'es': searchRepository.textSearchElastic,
    'psql': searchRepository.textSearchPsql,
    'psqltsv': searchRepository.textSearchPsqlTsv,
  };

  if(!Object.keys(search).includes(mode)) throw 'Illegal searching mode';

  const comments = await search[mode](searchString);
  const count = comments.length;
  const top100 = comments.slice(0, 100);
  return { comments: mapToViews(top100), count };
}

async function regexSearch(mode, searchString) {
  const search = {
    'es': searchRepository.regexSearchElastic,
    'psql': searchRepository.regexSearchPsql
  };

  if(!Object.keys(search).includes(mode)) throw 'Illegal searching mode';

  const comments = await search[mode](searchString);
  const count = comments.length;
  const top100 = comments.slice(0, 100);
  return { comments: mapToViews(top100), count };
}

async function weightedSearch(mode, searchString) {
  const search = {
    'es': searchRepository.weightedSearchElastic,
    'psql': searchRepository.weightedSearchPsqlTsv
  };

  if(!Object.keys(search).includes(mode)) throw 'Illegal searching mode';

  const comments = search[mode](searchString);
  const count = comments.length;
  const top100 = comments.slice(0, 100);
  return { comments: mapToViews(top100), count };
}

async function recentSearch(date, searchString) {
  const comments = await searchRepository.recentSearchElastic(date, searchString);
  const count = comments.length;
  const top100 = comments.slice(0, 100);
  return {comments: mapToViews(top100), count };
}

module.exports = { textSearch, regexSearch, weightedSearch, recentSearch };