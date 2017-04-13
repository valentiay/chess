var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next){
  res.render('test');
});

router.get('/chess', function(req, res, next){
    if(req.query.id != undefined){
        var id = req.query.id;
    }
    else{
        var id = -1;
    }
    res.render('chess', {id:id});
});
module.exports = router;