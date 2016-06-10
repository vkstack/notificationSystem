/**
 * Created by vkstack on 7/6/16.
 */
module.exports={
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
      console.log(oplogDoc);
    }
    else{
      User.find({subscriptions.collections[oplogDoc.collection]:true})
      .exec(function(err,users){
        if(err)return deferred.reject();
        sails.async.series([function(cb){
          if(oplogDoc.type!='u')
            cb();
          else{
            //document level subscriptions.
          }
        }])
      })
    }
    //User.find({subscriptions.collection}).
    deferred.resolve();
    return deferred.promise;
  },
  enque:function(Queue,oplogDoc){
    var deferred=sails.promise.defer()
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
    var deferred=sails.promise.defer(),timer,data;
    sails.amqp.connect('amqp://localhost', function(err, conn) {
      conn.createConfirmChannel(function(err, ch) {
        if(err){
          conn.close();
          deferred.reject(err);
        }else{
          ch.assertQueue(Queue, {durable: true});
          ch.prefetch(1);
          ch.consume(Queue,function(msg){
            console.log("A message");
            data=msg.content.toString();
            clearTimeout(timer);
            ch.ack(msg);
            setTimeout(function(){
              console.log("removing listener after listening");
              conn.close();
              deferred.resolve(data);
            },10);
          },{noAck: false});
        }
      });
      timer=setTimeout(function(){
        console.log("removing listener without listening");
        conn.close();
        deferred.reject(new Error("Nothing in the Queue."));
      },timeOut-1);
    });
    return deferred.promise;
  }
};
