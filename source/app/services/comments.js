const commentsRepository = require('../repositories/comments');

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

async function getThreadComment(threadId) {
  const [headComment] = await commentsRepository.fetchComment(threadId);
  return headComment != undefined ? mapToView(headComment) : null;
}

async function getTopComments(after) {
  const afterNotNull = after || 0;
  const commentsRaw = await commentsRepository.fetchTopComments(20, afterNotNull);
  return mapToViews(commentsRaw);
}

async function getCommentsForThread(threadId) {
  const commentsRaw = await commentsRepository.fetchCommentsForThread(threadId);
  return mapToViews(commentsRaw);
}

async function createComment(subreddit, author, threadId, text, ups) {
  let timeNow = new Date().getTime();
  await commentsRepository.persistComment(subreddit, author, timeNow, text, ups, threadId)
}

module.exports = { getTopComments, getCommentsForThread, getThreadComment, createComment };