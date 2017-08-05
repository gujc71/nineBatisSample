var express = require('express');
var router = express.Router();

//   MySQL 로드
var pool = require('./mysqlConn');
var batis9 = require("./nineBatis");
batis9.loadQuery(__dirname +'/sql', true);

router.get('/', function(req, res, next) {
    res.redirect('/board3/list');
});

router.get('/list', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = batis9.getQuery('selectBoardList');
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.render('board3/list', {rows: rows});
            connection.release();
        });
    }); 
});

router.get('/read', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = batis9.getQuery('selectBoardOne', {brdno: req.query.brdno});
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.render('board3/read', {row: rows[0]});
            connection.release();
        });
    }); 
});

router.get('/form', function(req,res,next){
    if (!req.query.brdno) {
        res.render('board3/form', {row: ""});
        return;
    }
    pool.getConnection(function (err, connection) {
        var sql = batis9.getQuery('selectBoardOne', {brdno: req.query.brdno});
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.render('board3/form', {row: rows[0]});
            connection.release();
        });
    }); 
});

router.post('/save', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = "";
        if (req.body.brdno) {
            sql = batis9.getQuery('updateBoard', req.body);
        } else {
            sql = batis9.getQuery('insertBoard', req.body);
        }

        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.redirect('/board3/list');
            connection.release();
        });
    }); 
});

router.get('/delete', function(req,res,next){
    pool.getConnection(function (err, connection) {
        var sql = batis9.getQuery('deleteBoard', {brdno: req.query.brdno});
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);

            res.redirect('/board3/list');
            connection.release();
        });
    }); 
});

module.exports = router;
