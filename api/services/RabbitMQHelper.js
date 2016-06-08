/**
 * Created by vkstack on 7/6/16.
 */
module.exports={
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
