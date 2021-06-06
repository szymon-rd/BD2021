var commentsRepository = require('../repositories/comments');

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
  let commentsRaw = await commentsRepository.fetchComment(threadId);
  let headComment = commentsRaw[0];
  if(headComment == undefined) return null;
  else {
    let commentView = mapToView(headComment);
    return commentView;
  }
}

async function getTopComments(after) {
  let afterNotNull = (after == null) ? 0 : after;
  let commentsRaw = await commentsRepository.fetchTopComments(20, afterNotNull);
  let commentsView = mapToViews(commentsRaw);
  return commentsView;
}

async function getCommentsForThread(threadId) {
  let commentsRaw = await commentsRepository.fetchCommentsForThread(threadId);
  let commentsView = mapToViews(commentsRaw);
  return commentsView;
}

async function createComment(subreddit, author, threadId, text, ups) {
  let timeNow = (new Date()).getTime();
  await commentsRepository.persistComment(subreddit, author, timeNow, text, ups, threadId)
}

module.exports = {getTopComments, getCommentsForThread, getThreadComment, createComment};