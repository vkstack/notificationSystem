var app = angular.module('mainApp', [])
  .controller('homeCtrl',['$scope','$http','$interval',function($scope,$http,$interval) {
    var self=this;
    var isConnected=true,isAlreadyRequested=false;

    $interval(function(){
      if(isConnected && !isAlreadyRequested){
        var time=new Date();
        console.log("fetching regular data at:",time);
        isAlreadyRequested=true;
        $http.get("user/getNotification")
          .then(function(response){
            isAlreadyRequested=false;
            console.log(response);
          },function(err){
            isAlreadyRequested=false;
            if(err.status==-1)
              isConnected=false;
            console.log("something fishy:",err);
          });
      }
    },1);
    $interval(function(){
      if(!isConnected){
        console.log("Trying hard to connect.");
        $http.get("user?random=1")
          .then(function(response){
            if(response.status!=-1)
              isConnected=true;
          })
      }
    },3000);

  }]);
