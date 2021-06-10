var searchRepository = require('../repositories/search');

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
  var comments;
  switch (mode) {
    case 'es':
      comments = await searchRepository.textSearchElastic(searchString);
      break;
    case 'psql':
      comments = await searchRepository.textSearchPsql(searchString);
      break;
    case 'psqltsv':
      comments = await searchRepository.textSearchPsqlTsv(searchString);
      break; 
    default:
      throw `illegal search mode ${mode}`;
  }
  let count = comments.length;
  let first = comments.slice(0,100);
  return {comments: mapToViews(first), count: count};
}

async function coordinateSearch(mode) {
  var comments;
  switch (mode) {
    case 'es':
      comments = await searchRepository.coordinatesSearchElastic();
      break;
    case 'psql':
      comments = await searchRepository.coordinatesSearchPsql();
      break;
    default:
      throw `illegal search mode ${mode}`;
  }
  let count = comments.length;
  let first = comments.slice(0,100);
  return {comments: mapToViews(first), count: count};
}

module.exports = {textSearch, coordinateSearch};