var AWS3Helper = require('../aws3/aws3');
var aws3 = new AWS3Helper('./aws3/config.json');

var express = require('express');
var router = express.Router();

// to cut off "data:image/png;base64,"
function formatRequestData(data) {
  return data.substring("data:image/png;base64,".length, data.length);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload/image', function (req, res, next) {
  var base64Img = formatRequestData(req.body.image.data);
  console.log(base64Img);
  var bucket = {name: 'exploreaws3', key: 'vinhtv'};
  var fileKey = 'temp.png';
  aws3.upload(base64Img, bucket, fileKey)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json(err);
    })
});

module.exports = router;
