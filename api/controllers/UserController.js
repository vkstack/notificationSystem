/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	home:function(req,res){
		res.render("homepage");
	},
	login:function(req,res){
		User.findOne({username:req.body.username})
			.exec(function(err,user){
				if(err)
					return res.negotiate(err);
				if(!user)
					return res.negotiate(new Error("No user found"));
				sails.bcrypt.compare(req.body.password,user.password,function(err,result){
					if(err)return res.negotiate(err);
					if(result==true){
						console.log(user);
						res.cookie("user",user,{signed:true});
						return res.ok(user);
					}
					res.negotiate(new Error("username/password is incorrect"));
				})
			});
	},
  getNotification:function(req,res){
    req.connection.setTimeout(10*60*1000);
    //console.log("query",req.query);
    console.log("timeOut started",req.signedCookies.user.id);
    //this will engage any request to 2 minutes.
    var timeout=60*1000,
      isResponded=false,
      timer=setTimeout(function(){
        console.log("No message in Queue");
        //qConnection.close();
         isResponded=true;
        res.ok({done:-1000});
      },timeout),
      queue=req.signedCookies.user.id;
    //Listener will be here if it listens from corresponding queue then i will trigger clearTimeout on above timer.
    RabbitMQHelper.queueListener(queue,timeout)
      .then(function(result){
        if(!isResponded){
          clearTimeout(timer);
          console.log("sending message from Queue");
          res.ok(result);
        }
      },function(err){
        if(!isResponded){
          clearTimeout(timer);
          res.negotiate(err);
        }
      });
    //setTimeout(function(){
    //  clearTimeout(timer);
    //  res.ok({done:1000});
    //},3000)
  }
};

