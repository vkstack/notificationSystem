var app = angular.module('mainApp', [])
  .controller('homeCtrl',['$scope','$http','$interval',function($scope,$http,$interval) {
    var self=this;
    var isConnected=true,isAlreadyRequested=false;
    io.socket.on('connect',function(){
      isConnected=true;
    });
    io.socket.on('disconnect',function(){
      isConnected=false;
    });
    $interval(function(){
      if(isConnected && !isAlreadyRequested){
        var time=new Date().getTime();
        console.log("fetching regular data:",time);
        isAlreadyRequested=true;
        $http({
          url:"user/getNotification",
          method:"GET",
          params:{time:time}
        }).then(function(response){
            isAlreadyRequested=false;
            console.log(response.data);
          },function(err){
            isAlreadyRequested=false;
            console.log(err);
          });
        //regular call to update notification.
      }
    },1);
  }]);
