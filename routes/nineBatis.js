var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var sqlData = {};

const CHAR_REG = '[-_!$#/&;%=|()<>0-9A-Za-z{}"\n\r\t ]*';
const IF_REG = new RegExp('@{if test=' + CHAR_REG +'{/if}', 'g');
const IF_RESULT_REG = new RegExp('}' + CHAR_REG +'{', 'g');

const QUOT_STRING_REG = new RegExp('".*"', 'g');
const INCLUDE_REG       = new RegExp('{include .*}', 'g');

function processIF(sql, params) {
    var matchList = sql.match(IF_REG);
    for(var inx in matchList){
        var str = matchList[inx];
        var if_test = str.match(QUOT_STRING_REG)[0];
        if_test = if_test.substr(1, if_test.length-2);
        
        var list = if_test.match(new RegExp('\\$[-_!$#/&%=|()<>0-9A-Za-z]*','g')); // = CHAR_REG - {}
        for(var i in list){
            var v = list[i];
            var vName = v.substr(1, v.length-1); // remove $
            
            if (params && params.hasOwnProperty(vName)){
                if_test = if_test.replace(v, params[vName]);
            } else {
                if_test = if_test.replace(v, "undefined");
            }
        }
        if (eval(if_test)===true){
            var if_result = str.match(IF_RESULT_REG)[0];
            if_result = if_result.substr(1, if_result.length-2);
            sql = sql.replace(str, if_result);
        } else{
            sql = sql.replace(str, '');
        }
    }
    return sql;
}    

function processInclude(sql) {
    var matchList = sql.match(INCLUDE_REG);
    for(var inx in matchList){
        var str = matchList[inx];
        var i_id = str.match(QUOT_STRING_REG)[0];
        i_id = i_id.substr(1, i_id.length-2);
        if (sqlData.hasOwnProperty(i_id)){
            sql = sql.replace(str, sqlData[i_id]);
        } else {
            throw new Error('There are no INCLUDE ID');
        }
    }
    return sql;
}

function processVariable(sql, params) {
    for (var key in params) {
        var str = params[key];
        if (typeof str !== "number") {
            str = str.replace(/'/g, '\'\'');
        }
        sql = sql.replace(new RegExp('#{' + key + '}', 'g'), '\'' + str + '\'')    // String
        sql = sql.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), params[key])    // Integer
    }
  
    return sql;
}

var debugMode=false;

function getQuery(id, params) {
    var sql = processInclude (sqlData[id]);
    sql = processIF(sql, params);
    sql = processVariable(sql, params);
    
    if (debugMode) {
        console.log(id);
        console.log(sql);
    }
    return sql;
};
exports.getQuery = getQuery;


exports.execQuery = function (pool, id, param, callback) {
    pool.getConnection(function (err, connection) {
        var sql = getQuery(id, param);
        connection.query(sql, function (err, rows) {
            if (err) console.error("err : " + err);
            connection.release();
            if (callback) {
                callback(rows);
            }
        });
    }); 
};

exports.loadQuery = function (filepath, mode) {
    if (mode) debugMode = mode;

    var fs = require('fs'),
        files = fs.readdirSync(filepath);
    var path  = require('path');
    
    filepath += '/';
    files.forEach(function(file) {
        if(path.extname(file) !== ".xml") {return;}
        var xml = fs.readFileSync(filepath+file, 'utf-8');

        parser.parseString(xml, function(err, data) {
            var jsonData = data.query;
            for(var obj in jsonData){
                if(jsonData.hasOwnProperty(obj)){
                    for(var prop in jsonData[obj]){
                        if (sqlData.hasOwnProperty(jsonData[obj][prop].$.id)){
                            throw new Error('There are duplicate SQL IDs');
                        }
                        sqlData[jsonData[obj][prop].$.id] = jsonData[obj][prop]._
                    }
                }
            }
            if (debugMode) {
                console.log('loaded XML : ' + file);
            }
        });
    });    
};

