var express = require('express');
var router = express.Router();
var commentsServices = require('../services/comments');

router.get('/', function(req, res, next) {
  res.redirect('comments/top')
})

router.get('/top', async function(req, res, next) {
  let afterParam = parseInt(req.query.after)
  let after = (isNaN(afterParam)) ? 0 : afterParam;
  let comments = await commentsServices.getTopComments(after);
  let showPrev = after > 0
  let prevAt = Math.max(0, after - 20)
  let nextAt = after + 20
  res.render('top-comments', {comments: comments, show_prev: showPrev, prev_at: prevAt, next_at: nextAt});
});

router.get('/t/:threadId', async function(req, res, next) {
  let threadId = req.params.threadId
  let threadComment = await commentsServices.getThreadComment(threadId);
  if(threadComment == null) {
    res.render('error', {message: 'Thread not found', error: {status: 404}})
  } else {
    let comments = await commentsServices.getCommentsForThread(threadId);
    res.render('thread', {tcomment: threadComment, comments: comments});
  }
});
 // subreddit, author, threadId, text, ups
router.post('/t/:threadId', async function(req, res, next) {
  let threadId = req.params.threadId
  let threadComment = await commentsServices.getThreadComment(threadId);
  let subreddit = threadComment.subreddit;
  let author = "testAuthor"; // mock author
  await commentsServices.createComment(subreddit, author, threadId, req.body.text, req.body.upvotes);
  res.redirect(req.originalUrl);
});

module.exports = router;
