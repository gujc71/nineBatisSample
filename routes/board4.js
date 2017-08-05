var express = require('express');
var router = express.Router();

//   MySQL 로드
var pool = require('./mysqlConn');
var batis9 = require("./nineBatis");

router.get('/', function(req, res, next) {
    res.redirect('/board4/list');
});

router.get('/list', function(req,res,next){
    batis9.execQuery(pool, 'selectBoardList', null, function (rows) {
         res.render('board4/list', {rows: rows});
    });
});

router.get('/read', function(req,res,next){
    batis9.execQuery(pool, 'selectBoardOne', {brdno: req.query.brdno}, function (rows) {
        res.render('board4/read', {row: rows[0]});
    });
});

router.get('/form', function(req,res,next){
    if (!req.query.brdno) {
        res.render('board4/form', {row: ""});
        return;
    }
    batis9.execQuery(pool, 'selectBoardOne', {brdno: req.query.brdno}, function (rows) {
        res.render('board4/form', {row: rows[0]});
    });
});

router.post('/save', function(req,res,next){
    var sql = req.body.brdno?'updateBoard':'insertBoard';

    batis9.execQuery(pool, sql, req.body, function (rows) {
        res.redirect('/board4/list');
    });
});

router.get('/delete', function(req,res,next){
    batis9.execQuery(pool, 'deleteBoard', {brdno: req.query.brdno}, function (rows) {
        res.redirect('/board4/list');
    });
});

module.exports = router;
