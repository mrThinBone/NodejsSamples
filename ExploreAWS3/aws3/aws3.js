/**
 * Created by DELL-INSPIRON on 9/7/2016.
 */
var fs = require('fs');
var Promise = require('promise');
var AWS = require('aws-sdk');

var AWS3Helper = function (config) {
  // constructor
  AWS.config.loadFromPath(config);
  this.s3 = new AWS.S3();
};

/**
 *
 * @returns [{Name: bucketName, Key: bucketKey, CreationDate: createDate}]
 */
AWS3Helper.prototype.listAllBuckets = function () {
  var mInstance = this;

  return new Promise(function (resolve, reject) {
    mInstance.s3.listBuckets(function(err, data) {
      if (err) { reject(err); }
      else {
        resolve(data.Buckets);
      }
    });
  });
};

AWS3Helper.prototype.delete = function (bucketName) {

  var mInstance = this;
  var params = {
    Bucket: bucketName
  };
  return new Promise(function (resolve, reject) {
    mInstance.empty(bucketName)
      .then(() => {
        mInstance.s3.deleteBucket(params, function (err, data) {
          if(err) reject(err);
          resolve();
        });
      })
      .catch(err => {
        reject(err);
      });
  });

};

/**
 *
 * @param name
 * @param key
 */
AWS3Helper.prototype.createBucket = function (name, key) {
  return new Promise(function (resolve, reject) {

    var s3 = new AWS.S3({params: {Bucket: name, Key: key}});
    s3.createBucket(function(err) {
      if (err) { reject(err) }
      else {
        //console.log(`Successfully create bucket ${name}/${key}`);
        resolve(s3);
      }
    });

  });
};

/**
 * upload file
 * @param srcPath: file path
 * @param bucket: {name:'bucketName', key: 'keyName'}
 * @param key: file name
 * @param clean: delete original file after successful delete
 *
 * @return { ETag: '"d980a3232928808a722ac90af60d2052"',
  Location: 'https://exploreaws3.s3-us-west-1.amazonaws.com/image.PNG',
  key: 'image.PNG',
  Key: 'image.PNG',
  Bucket: 'exploreaws3' }
 */
AWS3Helper.prototype.upload = function (srcPath, bucket, key, clean) {
  var body = fs.createReadStream(srcPath);
  var s3 = new AWS.S3({params: {Bucket: bucket.name, Key: bucket.key}});

  return new Promise(function (resolve, reject) {

    s3.upload({Key: key, Body: body}, function(err, data) {
      if(err) {
        //console.log("failed to upload: ", err);
        reject(err);
      } else {
        // console.log(data);
        if(clean) {
          fs.unlink(srcPath);
        }
        resolve(data);
      }
    });

  });
};

AWS3Helper.prototype.upload = function (base64Image, bucket, key) {
  var decodedImage = new Buffer(base64Image, 'base64');
  var path = "./" + (new Date().getTime()) + '.PNG';
  return new Promise(function (resolve, reject) {
    try {
      fs.writeFileSync(path, decodedImage);
      var body = fs.createReadStream(path);
      var s3 = new AWS.S3({params: {Bucket: bucket.name, Key: bucket.key}});
      s3.upload({Key: key, Body: body}, function(err, data) {
        if(err) {
          reject(err);
        } else {
          fs.unlink(path);
          resolve(data);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * streaming to local storage
 * @param destPath: file path
 * @param bucket: {name:'bucketName', key: 'keyName'}
 * @param key: a bucket's file
 */
AWS3Helper.prototype.stream = function (destPath, bucket, key) {
  var mInstance = this;
  var file = require('fs').createWriteStream(destPath);
  var params = {Bucket: bucket.name, Key: key};

  return new Promise(function (resolve, reject) {
    file.on('close', function () {
      resolve(destPath);
    });
    mInstance.s3.getObject(params).createReadStream()
      .on('error', function (err) {
        reject(err);
      })
      .pipe(file);
  });
};

AWS3Helper.prototype.empty = function (bucketName) {
  var mInstance = this;
  return new Promise(function (resolve, reject) {
    mInstance.list(bucketName)
      .then(objects => {
        console.log(objects);
        if(objects.length == 0)
          resolve();
        var params = {
          Bucket: bucketName,
          Delete: { Objects: [] }
        };
        for (var i in objects) {
          var obj = objects[i];
          params.Delete.Objects.push({Key: obj.Key});
        }
        mInstance.s3.deleteObjects(params, function (err, data) {
          if(err) reject(err);
          resolve();
        });
      })
      .catch(err => {
        reject(err);
      })
  });
};

/**
 * list all objects in given bucket
 * @param bucketName
 * @return [ { Key: 'image.PNG',
    LastModified: 2016-09-07T09:46:27.000Z,
    ETag: '"d980a3232928808a722ac90af60d2052"',
    Size: 12908,
    StorageClass: 'STANDARD',
    Owner:
     { DisplayName: 'thaivinhloc',
       ID: '7b3a185bb14edebac759150bb4ed17f943fc244e76fa0ee152a0190aa38a6b0b' }
     }
    ]
 */
AWS3Helper.prototype.list = function (bucketName) {
  var mInstance = this;
  var params = {
    Bucket: bucketName
  };

  return new Promise(function (resolve, reject) {
    mInstance.s3.listObjects(params, function(err, data) {
      if (err) reject(err);
      resolve(data.Contents);
    });
  });

};

module.exports = AWS3Helper;