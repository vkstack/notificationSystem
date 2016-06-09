module.exports={
  runn:function(){
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect("mongodb://localhost:27017/local", function(err, db) {
      if(err){console.error("ERROR",err); return;}

      console.log("Connected correctly to server");
      db.collection('oplog.$main', function (err, coll) {
        var stream = coll.find({},
          {
            tailable: true,
            awaitdata: true,
            numberOfRetries: Number.MAX_VALUE
          }).stream();
        stream.on('data', function(val) {
          if(/i|u|d|!n/.test(val.op))
          console.log('Doc: %j',val);
        });

        stream.on('error', function(val) {
          console.log('Error: %j', val);
        });

        stream.on('end', function(){
          console.log('End of stream');
        });
      });

    });
    // var oplog=sails.mongoOplog('mongodb://127.0.0.1:27017/local').tail();
    // console.log("Hi",oplog);
    // oplog.on('op', function (data) {
    //   console.log(data);
    // });

    // oplog.on('insert', function (doc) {
    //   console.log(doc.op);
    // });

    // oplog.on('update', function (doc) {
    //   console.log(doc.op);
    // });

    // oplog.on('delete', function (doc) {
    //   console.log(doc.op._id);
    // });

    // oplog.on('error', function (error) {
    //   console.log(error);
    // });

    // oplog.on('end', function () {
    //   console.log('Stream ended');
    // });

    // oplog.stop(function () {
    //   console.log('server stopped');
    // });
  }
};
