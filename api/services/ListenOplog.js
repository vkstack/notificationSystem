module.exports={

  keepOnListening:function(){
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
          if(/i|u|d|c/.test(val.op)){
            var operationMessage={};
            operationMessage.database=val.ns.split('.')[0];
            if(!/$/.test(val.ns.split('.')[1]))
              operationMessage.collection=val.ns.split('.')[1];
            /**
             * cc : collection created
             * cd : collection dropped
             * dd : database dropped
             * i  : document inserted
             * d  : document deleted
             * u  : document updated
             * */
            operationMessage.type=val.op;
            if(val.op==='c'){
              operationMessage.type="high level operation";
              if(val.o.create){
                operationMessage.type="cc";
                operationMessage.collection=val.o.create;
              }
              else if(val.o.drop){
                operationMessage.type="cd";
                operationMessage.collection=val.o.drop;
              }
              else if(val.o.dropDatabase){
                operationMessage.type="dd";
              }
            }

            else if(val.op==='d'){
              operationMessage.doc=val.o;
            }

            else if(val.op==='i'){
              operationMessage.doc=val.o;
            }

            else if(val.op==='u'){
              operationMessage.doc={
                _id:val.o2._id,
                updated:val.o
              };
            }

            RabbitMQHelper.queuePusher(operationMessage)
              .then(function(res){

              },function(err){

              });
          }
        });

        stream.on('error', function(val) {
          console.log('Error: %j', val);
        });
        stream.on('end', function(){
          console.log('End of stream');
        });
      });
    });
  }
};