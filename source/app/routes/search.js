var express = require('express');
var router = express.Router();
var searchService = require('../services/search');

router.get('/index', async function(req, res, next) {
  res.render('search_index');
});

router.post('/textSearch', async function(req, res, next) {
  let searchString = req.body.string
  let mode = req.body.mode
  res.redirect(302, `/search/textSearch?string=${searchString}&mode=${mode}`)
});

router.get('/textSearch', async function(req, res, next) {
  let startTime = new Date().getTime();
  let searchString = req.query.string
  let mode = req.query.mode
  let {comments, count} = await searchService.textSearch(mode, searchString)
  let endTime = new Date().getTime();
  let timeElapsed = endTime - startTime;
  res.render('text_search', {string: searchString, mode: mode, time: timeElapsed, count: count, comments: comments})
});

router.post('/coordinateSearch', async function(req, res, next) {
  let mode = req.body.mode
  res.redirect(302, `/search/coordinateSearch?mode=${mode}`)
});

router.get('/coordinateSearch', async function(req, res, next) {
  let startTime = new Date().getTime();
  let mode = req.query.mode
  let {comments, count} = await searchService.coordinateSearch(mode)
  let endTime = new Date().getTime();
  let timeElapsed = endTime - startTime;
  res.render('coordinate_search', {mode: mode, time: timeElapsed, count: count, comments: comments})
});

module.exports = router;
