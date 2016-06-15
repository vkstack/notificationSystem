var app = angular.module('mainApp', ['ui.router','ngCookies'])
  .config(function($stateProvider,$urlRouterProvider){
    $urlRouterProvider.otherwise("welcome");
    $stateProvider.state('welcome',{
      url:'/welcome',
      template:"<div><h3>Welcome to Notification manager</h3></div>"
    }).state("collection",{
      url:'/colSubscribe',
      templateUrl:"partials/colSubscribe",
      controller:'homeCtrl'
    }).state("document",{
      url:'/docSubscribe',
      templateUrl:"/partials/docSubscribe",
      controller:'homeCtrl'
    });
  })
  .run(['$interval','$http',function($interval,$http){
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
            if(response.data.message)
              angular.element(document.getElementById("randomNote")).prepend("<div class='divider'/><li class='section'>"+response.data.message+"</li>"+new Date().toLocaleString()+"<div class='divider'/>");
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
  }])
  .controller('homeCtrl',['$scope','$http','$interval','$cookies',function($scope,$http,$interval,$cookies) {

    var self=this;
    self.subsctiption=100000;
    self.notifications=[];

    self.signOut=function(){
      $cookies.remove('user');
      location.reload();
    };

    self.getSubCols=function(){
      $http({
        method:'get',
        url:'user',
        params:{id:JSON.parse(localStorage.getItem('user')).id}
      }).then(function(res){
        self.collectionSubscribed=res.data.subscriptions.collections;
      },function(err){
        console.log(err);
      });
    };

    self.subscribeCollection=function(){
      self.colSubForm=self.collectionSubscribed;
      console.log(self.colSubForm);
      $http({
        method:'post',
        url:'user/collectionSubscribe',
        data:self.colSubForm
      }).then(function(res){
        Materialize.toast('Collection subscription Updated for the You.', 3000, 'rounded','green');
      },function(err){
        Materialize.toast('Some Error occurred.', 3000, 'rounded');
      });
    };
    self.subscribeDocument=function(){
      var docFields=[];
      for(var key in self.docSubForm.fields){
        if(self.docSubForm.fields[key]===true){
          docFields.push(key);
        }
      }
      console.log(self.docSubForm);
      self.docSubForm.fields=docFields;
      $http({
        url:'user/documentSubscribe',
        data:self.docSubForm,
        method:'post'
      }).then(function(res){
        Materialize.toast('Field level subscription Updated for the You.', 3000, 'rounded','green');
      },function(err){
        Materialize.toast('Some Error occurred.', 3000, 'rounded');
      })
    };
    self.getTopNewsID = function(){
      $http.get('news')
        .then(function(res){
          self.newsDocs=res.data;
        });
    };
    self.getSubDocs = function(){

    };
    self.getDocSubscriptions=function(){
      $http({
        url:"user/getDocSub",
        params:{docID:self.docSubForm.docID},
        method:'get'
      }).then(function(response){
        if(response.data.id) {
          Materialize.toast('Subscribed fields becomes checked', 3000, 'rounded','green');
          for(var i in response.data.subscribers[0].fields)
          console.log(response.data);
        }
        else
          Materialize.toast('No subscriptions', 3000, 'rounded','green');
      },function(err){
        Materialize.toast('Some Error occurred.', 3000, 'rounded');
      });
    }
  }]);
