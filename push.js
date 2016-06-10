var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(err, conn) {
  if(err)
    return console.log(err);
  conn.createConfirmChannel(function(err, ch) {
    if(err){
      conn.close();
      return deferred.reject(err);
    }
    var q = '575520071ed490ea1b506910';
    ch.assertQueue(q, {durable: true});
    ch.sendToQueue(q,new Buffer(JSON.stringify({message:"Hi this is vajahat kareem"})),{persistent:true});
    setTimeout(function() {
      conn.close();
    }, 1000);
  });
});
