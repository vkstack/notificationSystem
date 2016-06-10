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
