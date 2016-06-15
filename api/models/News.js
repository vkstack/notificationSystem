/**
 * News.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName:"news",
  attributes: {
    text:{
      type:"string",
      defaultsTo:""
    },
    newsType:{
      type:"string",//local,global
      defaultsTo:"local",
    },
    place:{
      type:"string",
      defaultsTo:"unknown"
    },
    importanceLevel:{
      type:"integer",
      defaultsTo:9,//0 for most important
    }
  },
  beforeCreate:function(news,cb){
    if(news.type==0)
      news.type="local";
    else
      news.type="international";
    cb();
  },
  afterCreate:function(news,cb){
    Subscription.create({collectionName:"news",docID:news.id})
      .exec(function(err,data){
        if(err)
          return cb(err);
        cb();
      });
  }
};
