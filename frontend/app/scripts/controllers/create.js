'use strict';

/**
 * @ngdoc function
 * @name newsletterFrontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the newsletterFrontendApp
 */
angular.module('newsletterFrontendApp')
  .controller('MainCtrl', function ($scope, $http, ENV, store, $location, usSpinnerService, lodash, vcRecaptchaService) {
      var _ = lodash;
      $scope.backendURL = ENV.apiEndpoint + "/recipients/";
      $scope.error = false;
      $scope.success = false;
      var vm = this;

      $scope.publickKey = '6LdrPx8TAAAAAIn_9E3paV13kJdmesIm9AvGzzEb';

      setEmptyNews();

      $scope.addNews = function(){
        $scope.news.push({header: "", content: "", type: "news", link: ""});
      };

      function setEmptyNews () {
        $scope.news = [];
        $scope.news.push({header: "", content: "", type: "news", link: ""});
      };

      $scope.removeNews = function(index){
        $scope.news.splice(index, 1);
      };

      $scope.registerUser = function () {
        if($scope.email.trim() === "" || $scope.fullname.trim() === ""){
          $scope.errorMessage = "Todos los campos son requeridos";
          $scope.error = true;

          throw $scope.errorMessage;
        }

        if (vcRecaptchaService.getResponse() === ""){
          $scope.errorMessage = "Debe resolver el captcha para subscribirse";
          $scope.error = true;

          throw $scope.errorMessage;
        }

        $scope.registrationDisabled = true;
        usSpinnerService.spin('spinner-register');

        $http({
          method: 'POST',
          url: $scope.backendURL + 'send',
          data:{
            "address": $scope.email,
            "fullname": $scope.fullname,
            "operation": "create"
          },
          headers: {
            'Authorization': store.get('Authorization'),
            'Content-Type': 'application/json; charset=utf-8'
          }
        })
        .then(function(res){
          $scope.clicked = true;

          if( res.status === 200 ){
            $scope.success = true;
            $scope.fullname = '';
            $scope.email = '';
            $scope.success = true;
          } else{
            throw "Ha ocurrido un error, intente de nuevo";
          }
          console.log(res);
        })
        .catch(function(err){
          $scope.error = true;
          $scope.errorMessage = err;
          console.log("Error: ", err);
        })
        .finally(function(){
          $scope.registrationDisabled = false;
          usSpinnerService.stop('spinner-register');
        });
      };

      $scope.sendEmail = function () {
        $scope.errorMessage = "Ha ocurrido un error, intente de nuevo";

        _.forEach($scope.news, function(news){
          if(!news.header || news.header.trim() === "" ||
            !news.content  || news.content.trim() === "" ||
            !news.link || news.link.trim() === ""){
            $scope.errorMessage = "Todos los campos son requeridos";
            $scope.error = true;

            throw $scope.errorMessage;
          }
        });

        $scope.sendingDisabled = true;
        usSpinnerService.spin('spinner-send');

        $http({
          method: 'POST',
          url: $scope.backendURL + 'send',
          headers:{
            'Authorization': store.get('Authorization'),
            'Content-Type': 'application/json; charset=utf-8'
          },
          data: {
            "operation": "send",
            "subject": "Boletin diario",
            "content": $scope.news
          }
        })
        .then(function(res){
          if( res.status === 200 ) {
            setEmptyNews();
            $scope.success = true;
          } else {
            $scope.error = true;
          }

          console.log(res);
        })
        .catch(function(err){
          $scope.error = true;

          console.log(err);
        })
        .finally(function(){
          $scope.sendingDisabled = false;
          usSpinnerService.stop('spinner-send');
        });
      }

  });
