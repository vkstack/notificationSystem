/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
  sails.bcrypt      = require('bcrypt');
  sails.amqp        = require('amqplib/callback_api');
  sails.promise     = require('q');
  sails.async       = require('async');
  sails.mongodb     = require('mongodb');

  sails.mongoClient = sails.mongodb.MongoClient;
  ListenOplog.keepOnListening();

  //sails.mongoClient.connect("mongodb://localhost:27017/mydb",function(err,db){
  //  if(err) deferred.reject(err);
  //});

  //Subscription.query('db.subscription.find()')
  //  .exec(function(err,result){
  //    if(!err)console.log(result);
  //  });
  //News.find({"a.b.c":1})
  //  .then(function(row){
  //    console.log(JSON.stringify(row));
  //  });
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
