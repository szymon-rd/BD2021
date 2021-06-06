var express = require('express');
var router = express.Router();
var commentsServices = require('../services/comments');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let comments = await commentsServices.getComments();
  res.render('comments', {comments: comments});
});

module.exports = router;
