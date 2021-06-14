const express = require('express');
const router = express.Router();
const commentsServices = require('../services/comments');

router.get('/', (_req, res, _next) => {
  res.redirect('comments/top');
})

router.get('/top', async (req, res, _next) => {
  let after = parseInt(req.query.after);
  if(isNaN(after)) after = 0;

  const comments = await commentsServices.getTopComments(after);
  const showPrev = after > 0;
  const prevAt = Math.max(0, after - 20)
  const nextAt = after + 20

  res.render('top-comments', { comments: comments, show_prev: showPrev, prev_at: prevAt, next_at: nextAt });
});

router.get('/t/:threadId', async (req, res, _next) => {
  const { threadId } = req.params;

  const threadComment = await commentsServices.getThreadComment(threadId);

  if(threadComment === null) {
    res.render('error', { message: 'Thread not found', error: { status: 404 } })
  } else {
    const comments = await commentsServices.getCommentsForThread(threadId);
    res.render('thread', { tcomment: threadComment, comments: comments });
  }
});
 // subreddit, author, threadId, text, ups
router.post('/t/:threadId', async function(req, res, next) {
  const { threadId } = req.params;

  const threadComment = await commentsServices.getThreadComment(threadId);
  const { subreddit } = threadComment;
  let author = "testAuthor"; // mock author

  await commentsServices.createComment(subreddit, author, threadId, req.body.text, req.body.upvotes);
  
  res.redirect(req.originalUrl);
});

module.exports = router;
