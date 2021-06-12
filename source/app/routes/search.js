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

router.post('/regexSearch', async function(req, res, next) {
  let searchString = req.body.string
  let mode = req.body.mode
  res.redirect(302, `/search/regexSearch?string=${searchString}&mode=${mode}`)
});

router.get('/regexSearch', async function(req, res, next) {
  let startTime = new Date().getTime();
  let mode = req.query.mode
  let searchString = req.query.string
  let {comments, count} = await searchService.regexSearch(mode, searchString)
  let endTime = new Date().getTime();
  let timeElapsed = endTime - startTime;
  res.render('regex_search', {string: searchString, mode: mode, time: timeElapsed, count: count, comments: comments})
});

router.post('/weightedSearch', async function(req, res, next) {
  let searchString = req.body.string
  let mode = req.body.mode
  res.redirect(302, `/search/weightedSearch?string=${searchString}&mode=${mode}`)
});

router.get('/weightedSearch', async function(req, res, next) {
  let startTime = new Date().getTime();
  let mode = req.query.mode
  let searchString = req.query.string
  let {comments, count} = await searchService.weightedSearch(mode, searchString)
  let endTime = new Date().getTime();
  let timeElapsed = endTime - startTime;
  res.render('weighted_search', {string: searchString, mode: mode, time: timeElapsed, count: count, comments: comments})
});

router.post('/recentSearch', async function(req, res, next) {
  let searchString = req.body.string
  let date = req.body.date
  res.redirect(302, `/search/recentSearch?string=${searchString}&date=${date}`)
});

router.get('/recentSearch', async function(req, res, next) {
  let startTime = new Date().getTime();
  let searchString = req.query.string
  let date = req.query.date
  let {comments, count} = await searchService.recentSearch(date, searchString)
  let endTime = new Date().getTime();
  let timeElapsed = endTime - startTime;
  res.render('recent_search', {string: searchString, date: date, time: timeElapsed, count: count, comments: comments})
});

module.exports = router;
