/**
 * Test.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  tableName:"test",
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
  }
};

