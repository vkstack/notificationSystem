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
    console.log("timeOut started",req.signedCookies.user.id);
    var timeout=2*60*1000,
      isResponded=false,
      timer=setTimeout(function(){
        console.log("No message in Queue");
         isResponded=true;
        res.ok({done:-1000});
      },timeout),
      queue=req.signedCookies.user.id;
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
  }
};

