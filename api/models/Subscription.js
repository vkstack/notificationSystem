/**
 * Subscription.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    collectionName:{
      type:"string"
    },
    docID:{
      type:"string"
    },
    subscribers:{
      type:"json",
      defaultsTo:{}
    }
  }
};

