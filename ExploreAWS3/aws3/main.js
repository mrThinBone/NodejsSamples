var AWS3Helper = require('./aws3');
var aws3 = new AWS3Helper('./config.json');

/**
 * created bucket (name: exploreaws3, key: vinhtv)
 * @type {Array}
 */

// command line arguments
const args = process.argv;

/*function deleteBucket(bucketName){
  aws3.deleteBucket(bucketName)
    .then(() => {
      console.log(`${bucketName} is deleted`);
    })
    .catch(err => {
      console.log("Error: ", err);
    });
}*/

function emptyBucket(bucketName) {
  aws3.empty(bucketName)
    .then(() => {
      console.log(`${bucketName} is emptied`);
    })
    .catch(err => {
      console.log("Error: ", err);
    });
}

function listObjects(bucketName) {

}

function listAllBuckets() {
  aws3.listAllBuckets()
    .then(buckets => {
      for (var index in buckets) {
        var bucket = buckets[index];
        console.log("Bucket: ", bucket.Name, ' : ', bucket.Key);
      }
    })
    .catch(err => {
      console.log("Error: ", err);
    });
}

function createBucket(name, key) {
  aws3.createBucket(name, key)
    .then(s3BucketRef => {
      console.log(`Successfully create bucket ${name}/${key}`);
    })
    .catch(err => {
      console.log("Error:", err);
    });
}

function uploadImage(path, bucket, key) {
  aws3.upload(path, bucket, key, false)
    .then(data => {
      console.log("Uploaded: ", data);
    })
    .catch(err => {
      console.log("Error:", err);
    });
}

function streamFile(dest, bucket, key) {
  aws3.stream(dest, bucket, key)
    .then(filePath => {
      console.log(`Downloaded to ${filePath}`);
    })
    .catch(err => {
      console.log("Error:", err);
    });
}

function run() {
  var firstArg = args[2];
  if(args[2] === 'listall') {
    listAllBuckets();

  } else if(firstArg === 'create') {
    if(!args[3] || !args[4]) {
      console.log('missing (arguments) either: bucketName | key');
      return;
    }
    createBucket(args[3], args[4]);

  } else if(firstArg === 'upload') {
    if(!args[3] || !args[4]) {
      console.log('missing (arguments) either: bucketName | key');
      return;
    }
    // args[5]: image file path
    uploadImage(args[5], {name: args[3], key: args[4]}, 'image.PNG');

  } else if(firstArg === 'empty') {
    emptyBucket(args[3]);

  } else if(firstArg === 'list') {


  } else if(firstArg === 'stream') {
    streamFile('./image.PNG', {name: args[3], key: args[4]}, 'image.PNG');

  } else {
    console.log("unrecognized command");
  }
}

run();
// aws3.list();