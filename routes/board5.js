var express = require('express');
var router = express.Router();

//   MySQL 로드
var pool = require('./mysqlConn');
var batis9 = require("./nineBatis");

router.get('/', function(req, res, next) {
    res.redirect('/board5/list');
});

router.get('/list', function(req,res,next){
    batis9.execQuery(pool, 'selectBoardList5', null, function (rows) {
         res.render('board5/list', {rows: rows});
    });
});

router.get('/read', function(req,res,next){
    batis9.execQuery(pool, 'selectBoardOne', {brdno: req.query.brdno}, function (rows) {
        batis9.execQuery(pool, 'selectBoardList5', {brdno: req.query.brdno, cnt: 1}, function (nextRows) {
            res.render('board5/read', {row: rows[0], next: nextRows[0]});
        });
    });
});

router.get('/form', function(req,res,next){
    if (!req.query.brdno) {
        res.render('board5/form', {row: ""});
        return;
    }
    batis9.execQuery(pool, 'selectBoardOne', {brdno: req.query.brdno}, function (rows) {
        res.render('board5/form', {row: rows[0]});
    });
});

router.post('/save', function(req,res,next){
    var sql = req.body.brdno?'updateBoard':'insertBoard';

    batis9.execQuery(pool, sql, req.body, function (rows) {
        res.redirect('/board5/list');
    });
});

router.get('/delete', function(req,res,next){
    batis9.execQuery(pool, 'deleteBoard', {brdno: req.query.brdno}, function (rows) {
        res.redirect('/board5/list');
    });
});

module.exports = router;
