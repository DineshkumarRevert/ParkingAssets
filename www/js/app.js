// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var urlValue = '/api' ;
  var finalUrlValue = urlValue + '/parkingsolution/api';
if(ionic.Platform.isWebView()){
  urlValue = "http://masjidbuddy.com:8080";
  finalUrlValue = urlValue + '/parkingsolution/api';
}
var parkAsset = angular.module('starter', ['ionic', 'starter.controllers','commonServiceModule','ngCordova'])

parkAsset.run(function($ionicPlatform,commonService) {
if(/(android)/i.test(navigator.userAgent)){
document.addEventListener("Resume",
function() {
  if(Android.getEntryState()){
      commonService.showAlarmPopup('Alert', 'You have Notification',true);
    }
});
}
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.login', {
        cache:false,
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'templates/signup.html',
            controller: 'signupCtrl'
          }
        }
      })

      .state('app.user', {
        cache:false,
        url: '/user',
        views: {
          'menuContent': {
            templateUrl: 'templates/user.html',
            controller: 'userCtrl'
          }
        }
      })

      .state('app.search', {
        cache:false,
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html'
          }
        }
      })

      .state('app.browse', {
        cache:false,
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      })
      .state('app.playlists', {
        cache:false,
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })

      .state('app.dashboard', {
        cache:false,
        url: '/dashboard',
        views: {
          'menuContent': {
            templateUrl: 'templates/dashboard.html',
            controller: 'dashboardCtrl'
          }
        }
      })
      .state('app.masjidlist', {
        cache:false,
        url: '/masjidlist?masjidListas&header',
        views: {
          'menuContent': {
            templateUrl: 'templates/masjidlist.html',
            controller: 'masjidlistCtrl'
          }
        }
      })
      .state('app.parking', {
        cache:false,
        url: '/parking?selectedMasjid',
        views: {
          'menuContent': {
            templateUrl: 'templates/parking.html',
            controller: 'parkingCtrl'
          }
        }
      })
      .state('app.alerts', {
              cache:false,
              url: '/alerts',
              views: {
                'menuContent': {
                  templateUrl: 'templates/alerts.html',
                  controller: 'alertsCtrl'
                }
              }
            })
            .state('app.history', {
                    cache:false,
                    url: '/histroy',
                    views: {
                      'menuContent': {
                        templateUrl: 'templates/histroy.html',
                        controller: 'histroyCtrl',
                      }
                    }
                  })
      .state('app.single', {
        cache:false,
        url: '/playlist',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl',
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
//    if (localStorage.getItem('userId') !== null) {
//      $urlRouterProvider.otherwise('/app/playlist');
//    } else {
//      $urlRouterProvider.otherwise('/app/playlist');
//    }
       $urlRouterProvider.otherwise('/app/playlist');

  });
function  hideAlarmPopup(){
  if(/(android)/i.test(navigator.userAgent)){
    Android.stopMediaPlayer();
    Android.replaceAlarmState();
  }
}