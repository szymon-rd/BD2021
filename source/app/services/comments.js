var commentsRepository = require('../repositories/comments');

function mapToView(comments) {
  return comments.map(comment => {return {author: comment.author, created_at: new Date(parseInt(comment.created_utc)).toUTCString(), body: comment.body }});
}

async function getComments() {
  let commentsRaw = await commentsRepository.fetchComments();
  let commentsView = mapToView(commentsRaw);
  return commentsView;
}

async function getCommentsForThread(threadId) {
  let commentsRaw = await commentsRepository.fetchCommentsForThread(threadId);
  let commentsView = mapToView(commentsRaw);
  return commentsView;
}

module.exports = {getComments, getCommentsForThread};