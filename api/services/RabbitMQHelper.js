/**
 * Created by vkstack on 7/6/16.
 */
module.exports={
  /**
   * Format of opLog
   * {
   *    type        : /u|i|d|dd|cd|cc/,
   *    database    : [name of db]
   *    collection  : (name of collection)  //for u|i|d
   *    doc         : ()                    //for u|i|d
   * }
   *
   * */
  queuePusher:function(oplogDoc){
    var deferred=sails.promise.defer(),
    self=this;
    if(oplogDoc.type.length==2){
      User.find({type:"admin"},{fields:['id']}).exec(function(err,users){
        if(err)return deferred.reject();
        sails.async.each(users,function(user,cb){
          self.enque(user.id,oplogDoc).then(function(){
            cb();
          },function(){
            cb();
          });
        },function(){
          deferred.resolve();
        });
      });
    }
    else if(/i|d/.test(oplogDoc.type)){
      //console.log(oplogDoc);
      sails.mongoClient.connect("mongodb://localhost:27017/mydb",function(err,db){
        if(err) deferred.reject(err);
        db.collection('users').find({'subscriptions.collections':oplogDoc.collection},{'_id':1})
          .each(function(err,doc){
            if(err)return;
            if(doc){
              //console.log(doc._id.toString());
              self.enque(doc._id.toString(),oplogDoc).then(function(){},function(){});
            }
            else{
              //console.log('done');
              db.close();
              deferred.resolve();
            }
          });
      });
    }
    else if(oplogDoc.type=='u' && oplogDoc.collection=='news'){
      //console.log(JSON.stringify(oplogDoc));
      var x=1;
      var fieldsUpdated=[],
        setFields=oplogDoc.doc.updated.$set;
      for(var key in setFields){
        if(/text|newsType|place|importanceLevel/.test(key))
          fieldsUpdated.push(key);
      }
      //console.log(fieldsUpdated);
      sails.mongoClient.connect("mongodb://localhost:27017/mydb",function(err,db){
        if(err) deferred.reject(err);
        var UsersNotified={};
        db.collection('subscription').findOne({docID:oplogDoc.doc.id.toString(),"subscribers.fields":{$in:fieldsUpdated}},
          {"subscribers.$.id":1},function(err,doc){
            sails.async.series([
              function(cb){
                if(doc && doc.subscribers.length>0){
                  console.log(doc);
                  sails.async.each(doc.subscribers,function(userID,cb1){
                    self.enque(userID.id.toString(),oplogDoc)
                      .then(function(){
                        console.log("field level notification sent: ",userID.id);
                        UsersNotified[userID.id.toString()]=true;
                        cb1();
                      },function(){
                        cb1();
                      });
                  },function(){
                    cb();
                  })
                }
                else cb();
              },
              function(cb){
                db.collection('users').find({"subscriptions.collections":oplogDoc.collection},{id:1})
                  .each(function(err,doc){
                    if(err) return console.log(err);
                    if(doc){
                      //console.log(doc);
                      if(!UsersNotified[doc._id.toString()]){
                        self.enque(doc._id.toString(),oplogDoc)
                          .then(function(){},function(){});
                      }
                    }
                    else
                      cb();
                  });
              }
            ],function(){
              db.close();
            });
          });
      });
    }
    else{
      //console.log(JSON.stringify(oplogDoc));
    }
    return deferred.promise;
  },

  enque:function(Queue,oplogDoc){
    var deferred=sails.promise.defer();
    sails.amqp.connect('amqp://localhost', function(err, conn) {
      conn.createConfirmChannel(function(err, ch) {
        if(err){
          conn.close();
          deferred.reject(err);
        }else{
          ch.assertQueue(Queue, {durable: true});
          ch.sendToQueue(Queue,new Buffer(JSON.stringify(oplogDoc)),{persistent:true});
          setTimeout(function() {
            conn.close();
            deferred.resolve();
          }, 1000);
        }
      });
    });
    return deferred.promise;
  },

  queueListener:function(Queue,timeOut){
    var deferred=sails.promise.defer(),timer,tmpTimer,data,isConnectionOpened=false;
    sails.amqp.connect('amqp://localhost', function(err, conn) {
      conn.createConfirmChannel(function(err, ch) {
        if(err){
          console.log(err);
          conn.close();
          clearTimeout(timer);
          deferred.reject(err);
        }
        else{
          isConnectionOpened=true;
          ch.assertQueue(Queue, {durable: true});
          ch.prefetch(1);
          var isGotAnyMessage=false;
          tmpTimer=setInterval(function(){
            if(!isGotAnyMessage){
              ch.get(Queue,{noAck:false},function(err,msg){
                if(err){
                  console.log(err);
                  if(isConnectionOpened){
                    isConnectionOpened=false;
                    conn.close();
                  }
                  clearTimeout(timer);
                  deferred.reject(err);
                  clearInterval(tmpTimer);
                }
                else if(msg){
                  isGotAnyMessage=true;
                  data=msg.content.toString();
                  clearTimeout(timer);
                  ch.ack(msg);
                  setTimeout(function(){
                    if(isConnectionOpened){
                      isConnectionOpened=false;
                      conn.close();
                    }
                    deferred.resolve(JSON.parse(data));
                    clearInterval(tmpTimer);
                  },100);
                }
              });
            }
          },1);
        }
      });
      timer=setTimeout(function(){
        console.log("removing listener without listening");
        clearInterval(tmpTimer);
        if(isConnectionOpened){
          isConnectionOpened=false;
          conn.close();
        }
        deferred.reject(new Error("Nothing in the Queue."));
      },timeOut-10);
    });
    return deferred.promise;
  }
};
