/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'myMongo',
  tableName:'users',
  attributes: {
    name:{
      type:"string",
      required:true
    },
    username:{
      type:"string",
      unique:true,
      required:true
    },
    email:{
      type:"string",
      unique:true,
      required:true
    },
    type:{
      type:"string",
      unique:true,
      required:true
    },
    password:{
      type:"string",
      required:true
    },
    subscriptions:{
      type:"json",
      defaultsTo:{
        "collections":[],
        "documents":[]
        }
    },
    toJSON: function(){
      var obj = this.toObject(),
        x={
          users:false,
          news:false,
          collectionA:false,
          collectionB:false
        };
      for(var i in obj.subscriptions.collections)
        x[obj.subscriptions.collections[i]]=true;
      obj.subscriptions.collections=x;
      delete x;
      delete obj.password;
      return obj;
    }
  },
  beforeCreate: function(user, cb) {
    var isNormal=user.type;
    if(user.type==0)
        user.type="admin";
      else
        user.type="normal";
    sails.bcrypt.genSalt(10, function(err, salt) {
      sails.bcrypt.hash(user.password, salt, function(err, hash) {
        if (err){
          console.log(err);
          return cb(err);
        }
        user.password = hash;
        if(isNormal==0)
          user.subscriptions.collections=["users", "news", "collectionA", "collectionB"];
        cb();
      });
    });
  }
};
