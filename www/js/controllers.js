angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('signupCtrl', function ($scope, commonService, $cordovaBarcodeScanner, $state) {
    if (/(android)/i.test(navigator.userAgent))
      console.log(Android.getImei());
    $scope.scanBarcode = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
        console.log("Barcode Format -> " + imageData.format);
        console.log("Cancelled -> " + imageData.cancelled);
        if (imageData.text != '' && imageData.text != null) {
          $scope.rfid = { 'id': imageData.text }
          localStorage.setItem('tagId', imageData.text);
          var url = finalUrlValue + '/rfid/' + imageData.text;
          commonService.commonPostAjaxService(url, imageData.text, $scope.successScanning);
        } else {
          commonService.commonPopup('Error', 'Please scan the qr code properly');
        }
      }, function (error) {
        console.log("An error happened -> " + error);
      });



    }
    $scope.successScanning = function (response) {
      var output = response;
      if (output == null || output == '') {
        commonService.commonPopup('Error', 'Please Check your Internet Connection');
      }
      else if (output == 'false') {
        commonService.commonPopup('Error', 'Invalid QR code');
      } else if (output == 'exist') {
        commonService.commonPopup('Exists', 'Already you are an user');
      } else if (output == 'true') {
        commonService.commonPopup('Success', 'Welcome to the Masjid');
        $state.go('app.playlists');
      }
    }
    $scope.gotoLogin = function () {

      $state.go('app.user');

    }

  })

  .controller('PlaylistsCtrl', function ($scope, commonService, $state) {

    $scope.mail = 'false';
    $scope.otpValidation = 'false';
    $scope.getOTP = function (mailId) {
      $scope.Email = mailId;
      $scope.mailId = { 'mailId': mailId };
      var url = finalUrlValue + '/mail';
      console.log(url);
      commonService.commonPostAjaxService(url, angular.toJson($scope.mailId), $scope.successMailing);
    }
    $scope.successMailing = function (response) {
      console.log(response);
      $scope.generatedOtp = response;
      if ($scope.generatedOtp == null || $scope.generatedOtp == '') {
        commonService.commonPopup('Error', 'Please try again after sometime');
      }

      $scope.mail = 'true';
    }
    $scope.checkOtp = function (otp) {
      if ($scope.generatedOtp != otp) {
        commonService.commonPopup('Error', 'Invalid OTP');
      } else {
        // commonService.commonPopup('Success', 'Please feed your details');
        //$scope.otpValidation = 'true';
        //$scope.mail = 'true';
        $scope.otpValidation = 'true';
      }
    }

    $scope.setUserDetails = function (name, password, plateNo, model) {
      $scope.userData = {
        "mailId": $scope.Email,
        "name": name,
        "password": password,
        "plateNo": plateNo,
        "tagId": localStorage.getItem('tagId'),
        "model": model
      }
      var url = finalUrlValue + '/user';
      commonService.commonPostAjaxService(url, angular.toJson($scope.userData), $scope.successAddingUser);
    }
    $scope.successAddingUser = function (response) {
      if (response == null && response == '') {
        commonService.commonPostAjaxService('Error', 'Please try again after sometime');
      }
      $scope.userId = response;
      localStorage.setItem('userId', $scope.userId);
      $state.go('app.single');
    }

  })
  .controller('userCtrl', function ($scope, commonService, $state, $ionicPopup) {
    //$scope.modal.hide();
    $scope.getLogin = function (mailId, password) {
      $scope.credentials = {
        "mailId": mailId,
        "password": password
      }
      var url = finalUrlValue + '/user/valid';
      commonService.commonPostAjaxService(url, angular.toJson($scope.credentials), $scope.successLogin);

    }
    $scope.successLogin = function (response) {
      var output = response;
      if (output == null || output == '') {
        commonService.commonPopup('Error', 'Please try again after sometime');
      } else if (output == 'not exist') {
        commonService.commonPopup('Error', 'Invalid credentials');
      } else if (output == 'error') {
        commonService.commonPopup('Error', 'Something went wrong');
      } else {
        localStorage.setItem('userId', output);
        var url = finalUrlValue + '/user/' + output;
        commonService.commonPostAjaxService(url, angular.toJson($scope.userValues), $scope.successUserValues);
        //$state.go('app.dashboard');
      }
    }
    $scope.successUserValues = function (value) {
      var output = value;
      $scope.vehicleDetails = commonService.commonVehicleDetails(output);
      localStorage.setItem("vehicleDetails", JSON.stringify($scope.vehicleDetails));
      $state.go('app.dashboard');
    }
    $scope.forgetPassword = function () {
      $scope.data = {};
      var confirmPopup = $ionicPopup.show({
        title: 'Enter your mail id!',
        template: '<input type="email" ng-model="data.mail" style="width:10">',
        scope: $scope,
        cssClass: 'custom-popup',
        buttons: [
          { text: 'cancel' },
          {
            text: '<b>Confirm<b>',
            type: 'button-energized',
            onTap: function (e) {
              if (!$scope.data.mail) {
                //don't allow the user to close unless he enters wifi password
                commonService.commonPopup('Error', 'Please Enter a Valid Email Id');
                e.preventDefault();
              } else {
                $scope.forgetPwd = { 'mailId': $scope.data.mail };
                var url = finalUrlValue + '/forget';
                commonService.commonPostAjaxService(url, angular.toJson($scope.forgetPwd), $scope.successGettingPwd);
              }
              //alert($scope.data.mail);
            }
          }
        ]
      });
    }
    $scope.successGettingPwd = function (result) {
      if (result == null || result == '') {
        commonService.commonPopup('Error', 'Please try again after sometime');
      } else if (result == 'not exist') {
        commonService.commonPopup('Error', 'Invalid Credentials');
      } else if (result == 'success') {
        $scope.modal.hide();
        commonService.commonPopup('success', 'Password sent to your mailId, Please check it');
      } else {
        commonService.commonPopup('Error', 'something went to wrong');
      }
    }
  })
  .controller('dashboardCtrl', function ($scope, commonService, $state, $cordovaGeolocation, $ionicModal) {
    $scope.token = '';
    if (/(android)/i.test(navigator.userAgent)) {
      console.log(Android.getImei());
      console.log(Android.getImei());
      $scope.token = Android.getToken();
      $scope.imei = Android.getImei();
    } else {
      $scope.imei = device.uuid;
      document.addEventListener("deviceReady",
        function () {
          window.FirebasePlugin.getToken(function (token) {
            $scope.token = token;
          }, function (error) {
            console.log(error)
          });


        });
    }
    $ionicModal.fromTemplateUrl('templates/parkingMap.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.parkingModal = modal;
    });
    $scope.showParkingMap = function () {
      $scope.parkingModal.show();
    };
    $scope.closeParkingMap = function () {
      $scope.parkingModal.hide();
    }
    $scope.storePushnotification = function () {
      $scope.pushDetails = {
        "imeiNo": $scope.imei,
        "devicetoken": localStorage.getItem('token'),
        "userId": localStorage.getItem('userId'),
        "OS": "ios",
        "status": 1
      }
      console.log('token' + JSON.stringify($scope.pushDetails));
      var url = finalUrlValue + '/user/pushnotification';
      commonService.commonPostAjaxService(url, angular.toJson($scope.pushDetails), $scope.success);
    }
    $scope.success = function (response) {
      var output = response;
      if (output == null || output == "" || output == 'error') {
        commonService.commonPopup('Error', 'Please try again after sometime');
      } else if (output = 'success') {
        localStorage.setItem('Push Statas', 'persisted');
      }
    }
    if (localStorage.getItem('Push Statas') == null) {
      $scope.storePushnotification();
    }
    $scope.UIchanges = function (vehicleDetails) {
      if (vehicleDetails.parkingSlot == 'Nill')
        $scope.image = 'img/redcar.png';
      else
        $scope.image = 'img/greencar.png';
      $scope.vipParkingPercentage = {
        height: vehicleDetails.vipParkingPercentage + "%"
      };
      $scope.generalParkingPercentage = {
        height: vehicleDetails.generalParkingPercentage + "%"
      };
    };
    $scope.vehicleDetails = JSON.parse(localStorage.getItem('vehicleDetails'));
    $scope.UIchanges($scope.vehicleDetails);
    $scope.createWebSocket = function () {
      $scope.ws = new WebSocket(
        "ws://masjidbuddy.com:8080/parkingsolution/dashboardendpoint");
      $scope.ws.onopen = function () {
        $scope.ws.send(localStorage.getItem('userId'));
        console.log("Web Socket is connected");
      }
      $scope.ws.onclose = function () {
        console.log("Web Socket is Closed");
      }
      $scope.ws.onmessage = function (evt) {
        if ($state.current.name == 'app.dashboard') {
          $scope.tempVehicleDetails = JSON.parse(evt.data);
          //          $scope.vehicleDetails = commonService.commonVehicleDetails($scope.tempVehicleDetails);
          //          $scope.UIchanges($scope.vehicleDetails);
          $scope.$apply(function () {
            $scope.vehicleDetails = commonService.commonVehicleDetails($scope.tempVehicleDetails);
            $scope.UIchanges($scope.vehicleDetails);
          });
        } else
          $scope.ws.close();
      }
    }
    $scope.$on('$destroy', function () {
      $scope.ws.close();
    });
    $scope.createWebSocket();
    $scope.showSelected = function (valueSelected) {
      $state.go('app.' + valueSelected);
    }
  })

  .controller('PlaylistCtrl', function ($scope, commonService, $state, $cordovaGeolocation, $ionicLoading, $cordovaBarcodeScanner) {
    var Latitude, Longitude;
    if (/(android)/i.test(navigator.userAgent)) {
      console.log(Android.getImei());
      console.log(Android.getLocation());
      //alert(Android.getToken());
      document.addEventListener("deviceReady",
        function () {
          if (Android.getEntryState()) {
            commonService.showAlarmPopup('Alert', 'You have Notification', true);
          }
        });
    } else {
      document.addEventListener("deviceReady",
        function () {
          window.FirebasePlugin.grantPermission(function () {
            console.log('Permission is granted for ios');
          }, function (error) {
            console.log('error in push permission');

          });
          window.FirebasePlugin.getToken(function (token) {
            console.log(token);
            //alert(token);
            localStorage.setItem('token', token);
          }, function (error) {
            console.log(error)
          });


        });
    }
    if (localStorage.getItem('userId') == null) {
      $scope.userIdentification = false;
    } else {
      $scope.userIdentification = true;
    }
    $scope.calcDist = function (destLat, destLng) {
      if (/(android)/i.test(navigator.userAgent))
        var radlat1 = (Math.PI * Android.getLocation().split(',')[0]) / 180;
      else
        var radlat1 = (Math.PI * Latitude) / 180;
      var radlat2 = Math.PI * destLat / 180;
      if (/(android)/i.test(navigator.userAgent))
        var theta = Android.getLocation().split(',')[1] - destLng;
      else
        var theta = Longitude - destLng;
      var radtheta = Math.PI * theta / 180
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist)
      dist = dist * 180 / Math.PI
      dist = dist * 60 * 1.1515
      dist = dist * 1.609344;
      return dist;
    }

    $scope.showDetails = function (value) {
      $scope.heading = value;
      if (/(android)/i.test(navigator.userAgent))
        console.log(Android.getLocation());
      else {
        var onSuccess = function (position) {
          Latitude = position.coords.latitude;
          Longitude = position.coords.longitude;
          $ionicLoading.show();
          if (/(android)/i.test(navigator.userAgent)) {
            $scope.latLong = Android.getLocation().split(',')[0] + ',' + Android.getLocation().split(',')[1];
          } else {
            $scope.latLong = Latitude + ',' + Longitude;
          }
          $scope.mapUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + $scope.latLong + '&radius=20000&type=mosque&key=AIzaSyDqP_RawXoK6k1giy6IGBoJZwwEV4Ku-v4&sensor=true';
          console.log($scope.mapUrl);
          commonService.commonUrlHitMethod($scope.mapUrl, $scope.successHitting);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
          alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
        }
        // document.addEventListener("deviceready", onDeviceReady, true);
        // function onDeviceReady() {

        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        // }


      }



    }
    // var onSuccess = function (position) {
    //   Latitude = position.coords.latitude;
    //   Longitude = position.coords.longitude;
    // }
    // var onError = function () {

    //   alert('code: ' + error.code + '\n' +
    //     'message: ' + error.message + '\n');
    // }



    $scope.successHitting = function (data) {
      //alert(JSON.stringify(data));
      if (data.status != 'OK') {
        $ionicLoading.hide();
        commonService.commonPopup('Error', 'Please try again after sometime');
      } else {
        $ionicLoading.hide();
        $scope.listOfMasjids = data.results;
        for (var i = 0; i < data.results.length; i++) {
          $scope.resultantDistance = $scope.calcDist(data.results[i].geometry.location.lat, data.results[i].geometry.location.lng);
          $scope.object = { 'distance': $scope.resultantDistance.toFixed(2) };
          angular.merge(data.results[i], $scope.object);
        }
        $state.go('app.masjidlist', { 'masjidListas': JSON.stringify($scope.listOfMasjids), 'header': $scope.heading });
      }
    }
    $scope.gotoDashboard = function () {
      var url = finalUrlValue + '/user/' + localStorage.getItem('userId');;
      commonService.commonPostAjaxService(url, angular.toJson($scope.userValues), $scope.successLogging);
      // $state.go('app.dashboard');
    }
    $scope.successLogging = function (value) {
      localStorage.setItem("vehicleDetails", JSON.stringify(commonService.commonVehicleDetails(value)));
      $state.go('app.dashboard');
    }
    $scope.gotoSignUp = function () {
      // console.log(Android.getImei());
      // $scope.scanBarcode = function(){
      document.addEventListener("deviceready", init, false);
      function init() {
        $cordovaBarcodeScanner.scan().then(function (imageData) {
          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);
          if (imageData.text != '' && imageData.text != null) {
            $scope.rfid = { 'id': imageData.text }
            localStorage.setItem('tagId', imageData.text);
            var url = finalUrlValue + '/rfid/' + imageData.text;
            commonService.commonPostAjaxService(url, imageData.text, $scope.successScanning);
          } else {
            commonService.commonPopup('Error', 'Please scan the qr code properly');
          }
        }, function (error) {
          console.log("An error happened -> " + error);
        });

      }
    }
    //}
    $scope.successScanning = function (response) {
      var output = response;
      if (output == null || output == '') {
        commonService.commonPopup('Error', 'Please Check your Internet Connection');
      }
      else if (output == 'false') {
        commonService.commonPopup('Error', 'Invalid QR code');
      } else if (output == 'exist') {
        commonService.commonPopup('Exists', 'Already you are an user');
      } else if (output == 'true') {
        commonService.commonPopup('Success', 'Welcome to the Masjid');
        $state.go('app.playlists');
      }
    }
    $scope.gotoLogin = function () {

      $state.go('app.user');

    }

  })
  .controller('masjidlistCtrl', function ($scope, commonService, $state, $stateParams) {
    $scope.heading = $stateParams.header;
    $scope.listOfMasjidsasd = [];
    $scope.listOfMasjidsasd = JSON.parse($stateParams.masjidListas);
    $scope.masjidSelected = function (content, lat, long) {
      //alert(lat + ' '+long + content);
      if (content == 'Masjid Parking')
        $state.go('app.parking', { 'selectedMasjid': lat + ',' + long });
      else {
        if (/(android)/i.test(navigator.userAgent)) {
          $scope.latlong1 = Android.getLocation().split(',')[0] + ',' + Android.getLocation().split(',')[1];
          $scope.latlong2 = lat + ',' + long;
          $scope.googleUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + $scope.latlong1 + '&destination=' + $scope.latlong2 + '&travelmode=driving';
          //commonService.commonUrlHitMethod($scope.googleUrl,$scope.successMap);
          var win = window.open($scope.googleUrl, '_blank');
          win.focus();
        } else {
          var Latitude, Longitude;
          var onSuccess = function (position) {
            Latitude = position.coords.latitude;
            Longitude = position.coords.longitude;
            $scope.latlong1 = Latitude + ',' + Longitude;
            $scope.latlong2 = lat + ',' + long;
            $scope.googleUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + $scope.latlong1 + '&destination=' + $scope.latlong2 + '&travelmode=driving';
            //commonService.commonUrlHitMethod($scope.googleUrl,$scope.successMap);
            var win = window.open($scope.googleUrl, '_blank');
            win.focus();
          }
          function onError(error) {
            alert('code: ' + error.code + '\n' +
              'message: ' + error.message + '\n');
          }
          navigator.geolocation.getCurrentPosition(onSuccess, onError);

        }
      }
      $scope.successMap = function (data) {
        console.log('success');
      }
    }
    $scope.gobackFrmMasjid = function () {
      $state.go('app.single');
    }
  })
  .controller('alertsCtrl', function ($scope, $state) {
    $scope.createWebSocket = function () {
      $scope.ws = new WebSocket(
        "ws://masjidbuddy.com:8080/parkingsolution/alertendpoint");
      $scope.ws.onopen = function () {
        $scope.ws.send(localStorage.getItem('userId'));
        console.log("Web Socket is connected");
      }
      $scope.ws.onclose = function () {
        console.log("Web Socket is Closed");
      }
      $scope.ws.onmessage = function (evt) {
        if ($state.current.name == 'app.alerts') {
          $scope.$apply(function () {
            $scope.finaldata = [];
            $scope.finaldata = evt.data.split(',');
            var alertsContent = document.getElementById("alertsContent");
            alertsContent.innerHTML = "";
            for (var i = 0; i < $scope.finaldata.length; i++) {
              var ele = document.createElement('div');
              ele.className = "dashboard-alerts";
              ele.innerText = $scope.finaldata[i];
              alertsContent.appendChild(ele);
            }
          });
        } else
          $scope.ws.close();
      }
    }
    $scope.$on('$destroy', function () {
      $scope.ws.close();
    });
    $scope.createWebSocket();
    $scope.goBack = function () {
      $state.go('app.single')
    }
  })
  .controller('parkingCtrl', function ($scope, commonService, $state, $stateParams) {
    $scope.latlong = $stateParams.selectedMasjid;
    //alert($scope.latlong);
    $scope.showMasjidDetails = function () {
      $scope.googleUrl = 'http://maps.google.com/maps?q=loc:' + $scope.latlong;
      var win = window.open($scope.googleUrl, '_blank');
      win.focus();
    }
    $scope.gobackFrmParking = function () {
      $state.go('app.single');
    }
  })
  .controller('histroyCtrl', function ($scope, commonService, $state, $stateParams, $ionicPopup, $ionicLoading) {
    console.log("success Histroy ctrl");
    $scope.date = {};
    var myPopup;
    $scope.histroy = [];
    $scope.sucessFromHistory = function (data) {
      $scope.histroy = [];
      $scope.histroy = data;
      console.log(data);
      document.getElementsByClassName("backdrop")[0] != null ? document.body.removeChild(document.getElementsByClassName("backdrop")[0]) : "";
      $ionicLoading.hide();
      if (data.length == 0) {
        $ionicLoading.show({ template: 'No Data Found!', noBackdrop: true, duration: 2500 });
      }
    };
    $scope.gethistroy = function (body) {
      $ionicLoading.show();
      $scope.body = {
        "userId": "14",
        "fromTime": "2019-01-03 00:00:01",
        "toTime": "2019-01-03 23:59:59"
      };
      var url = finalUrlValue + '/user/report';
      commonService.commonPostAjaxService(url, angular.toJson(body), $scope.sucessFromHistory);
    }
    $scope.selectCustom = function (data) {
      console.log(data);
      $scope.flag = true;
      switch (data) {
        case "today":
          $scope.date.from = new Date();
          $scope.date.to = new Date();
          break;
        case "yesterday":
          $scope.date.from = new Date(new Date() - 24 * 60 * 60 * 1000);
          $scope.date.to = new Date(new Date() - 24 * 60 * 60 * 1000);
          break;
        case "twoDaysBefore":
          $scope.date.from = new Date(new Date() - 2 * 24 * 60 * 60 * 1000);
          $scope.date.to = new Date(new Date() - 2 * 24 * 60 * 60 * 1000);
          break;
        case "custom":
          $scope.flag = false
          break;
      }
      if ($scope.flag) {
        $scope.formHistroyData();
      }
      myPopup.close();
    }
    $scope.formHistroyData = function () {
      if ($scope.date.from == undefined) {
        commonService.commonPopup('Error', 'Please Select From Date');
      }
      else if ($scope.date.to == undefined) {
        commonService.commonPopup('Error', 'Please Select To Date');
      }
      else {
        $scope.body = {
          "userId": localStorage.getItem("userId"),
          "fromTime": commonService.getformatDate($scope.date.from, "start"),
          "toTime": commonService.getformatDate($scope.date.to, "end")
        }
        $scope.gethistroy($scope.body);
      }
    };
    $scope.showPopup = function () {
      $scope.data = {};
      myPopup = $ionicPopup.show({
        template: `
              <ion-radio ng-model="choice" ng-value="'today'"  ng-click="selectCustom(choice)">Today</ion-radio>
              <ion-radio ng-model="choice" ng-value="'yesterday'"  ng-click="selectCustom(choice)">Yesterday</ion-radio>
              <ion-radio ng-model="choice" ng-value="'twoDaysBefore'"  ng-click="selectCustom(choice)">Two Days Before</ion-radio>
              <ion-radio ng-model="choice" ng-value="'custom'" ng-click="selectCustom(choice)">Custom</ion-radio>
              `,
        title: 'Choose Date',
        subTitle: '',
        scope: $scope,
        buttons: []
      });
    };
    $scope.exportPDF = function () {
      if ($scope.histroy.length > 0) {
        $scope.data = [{
          "parkingNumber": "Parking No.",
          "entryTime": "Entry Time",
          "exitTime": "Exit Time",
          "duration": "Hours"
        }];
        for (var i = 0; i < $scope.histroy.length; i++) {
          var obj = {};
          obj.parkingNumber = $scope.histroy[i].parkingNumber;
          obj.entryTime = $scope.gridFormatTime($scope.histroy[i].entryTime);
          obj.exitTime = $scope.gridFormatTime($scope.histroy[i].exitTime);
          obj.duration = $scope.gridFormatHours($scope.histroy[i].duration);
          $scope.data.push(obj);
        }
        $scope.reportName = "Report_" + commonService.getformatDate($scope.date.from) + "_" + commonService.getformatDate($scope.date.to);
        commonService.downloadReport($scope.data, $scope.reportName);
      }
      else {
        commonService.commonPopup('Error', 'No data Found');
      }
    };
    $scope.gridFormatTime = function (value) {
      if (value != "---") {
        var date, time;
        date = commonService.getformatDate(new Date(value));
        time = commonService.getformatTime(new Date(value));
        return time + "  " + date;
      }
      else {
        return value;
      }
    }
    $scope.gridFormatHours = function (value) {
      if (value != "---") {
        var hours, minutes;
        hours = Math.round(value / 60);
        hours = hours.toString().length > 1 ? hours : '0' + hours;
        minutes = Math.round(value % 60);
        minutes = minutes.toString().length > 1 ? minutes : '0' + minutes;
        return hours + ":" + minutes;
      }
      else {
        return value;
      }
    }
    $scope.showPopup();

    $scope.gobackFrmHistory = function () {
      $state.go('app.single')
    }
  });
