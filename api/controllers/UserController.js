/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  test:function(req,res){
    x="users";
    var query="db.users.find({'subscriptions.collection."+x+"':true})";
    console.log(query);
    User.query(query)
      .then(function(result){
        res.ok(result);
      },function(err){
        res.ok(err);
      });
  },
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
        res.ok({data:-1});
      },timeout),
      queue=req.signedCookies.user.id;
    RabbitMQHelper.queueListener(queue,timeout)
      .then(function(result){
        if(!isResponded){
          clearTimeout(timer);
          console.log("sending message from Queue");
          var message=result.message;
          if(result.type==='cc')
            message='<p>A collection: <b>'+result.collection+'</b> in database: <b>'+result.database+'</b> is created.</p>';
          else if(result.type==='cd')
            message='<p>A collection: <b>'+result.collection+'</b> from database: <b>'+result.database+'</b> is dropped.</p>';
          else if(result.type==='dd')
            message='<p>A databased: <b>'+result.database+'</b> dropped.</p>';
          res.ok({message:message});
        }
      },function(err){
        if(!isResponded){
          clearTimeout(timer);
          res.negotiate(err);
        }
      });
  },
  colSubscribe:function(req,res){
    res.render('partials/colSubscription');
  },
  docSubscribe:function(req,res){
    res.render('partials/docSubscription');
  },
  collectionSubscribe:function(req,res){
    console.log(req.body);
    var userID=req.signedCookies.user.id,
      fields=[];
    for(var key in req.body){
      if(req.body[key]){
        fields.push(key);
      }
    }
    User.update({id:userID},{"subscriptions.collections":fields})
      .exec(function(err){
        if(err) return res.negotiate(err);
        res.ok();
      });
  }
};

