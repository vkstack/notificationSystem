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
      //console.log(oplogDoc);
    }
    else{
      sails.async.parallel([function(cb){
        if(oplogDoc.type!='u')
          cb();
        else{
          //document level subscriptions.
        }
      },function(cb){
        var finding="subscriptions.collections["+oplogDoc.collection+"]";
        User.find({})
          .exec(function(err,users){
            if(err)cb(err);
          })
      }],function(err,results){
        deferred.resolve();
      });
    }
    //User.find({subscriptions.collection}).
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
    var deferred=sails.promise.defer(),timer,tmpIntervalTimer,data;
    sails.amqp.connect('amqp://localhost', function(err, conn) {
      conn.createConfirmChannel(function(err, ch) {
        if(err){
          console.log(err);
          conn.close();
          clearTimeout(timer);
          deferred.reject(err);
        }
        else{
          ch.assertQueue(Queue, {durable: true});
          ch.prefetch(1);
          ch.consume(Queue,function(msg){
            data=msg.content.toString();
            console.log(data);
            clearTimeout(timer);
            ch.ack(msg);
            setTimeout(function(){
              console.log("removing listener after listening");
              conn.close();
              deferred.resolve(JSON.parse(data));
            },100);
          },{noAck: false});
        }
      });
      timer=setTimeout(function(){
        console.log("removing listener without listening");
        //clearInterval(tmpIntervalTimer);
        conn.close();
        deferred.reject(new Error("Nothing in the Queue."));
      },timeOut-10);
    });
    return deferred.promise;
  }
};
