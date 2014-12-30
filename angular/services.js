'use strict';

/* Service */

// Three main section
var wegenartServices = angular.module('wegenartServices', ['ngResource']);

wegenartServices.service('fileUpload', ['$http', 'apiHost', function ($http, apiHost) {
    this.uploadFileToUrl = function(file, succ){
        var fd = new FormData();
        fd.append('avatar', file);
        $http.post(apiHost + "/accounts/uploadavatar/", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
                console.log('post succ resp=');
                console.log(response);
                succ(response);
        })
        .error(function(response){
                console.log('post err resp=');
                consoloe.log(response);
        });
    }
}]);

wegenartServices.factory('Home', ['$resource','apiHost',
    function($resource, apiHost){
        return $resource(apiHost + '/:_type/:_type2', {}, {
            node_tree: {method:'GET', params:{_type:'node', _type2:'node_tree'}},

        });
    }
]);

wegenartServices.factory('Account', ['$resource','apiHost',
    function($resource, apiHost){
        return $resource(apiHost + '/accounts/:_type/:_type2', {}, {
            signin: {method: 'POST', params:{_type: 'login'}},
            signout: {method: 'POST', params:{_type: 'logout'}},
            checkifregister:{method: 'GET', params:{_type: 'checkifregister'}},
            register:{method: 'POST', params:{_type: 'register'}},
            sendcaptcha:{method:'GET', params:{_type:'sendcaptcha'}},
            faq:{method:'GET', params:{_type:'faq', _type2:'question'}},
            changePWD:{method:'POST', params:{_type:'changepassword', _type2:''}},
            get_instrument_list:{method:'GET', params:{_type:'instrument_list', _type2:''}},
            gen_instrument:{method:'GET', params:{_type:'gen_instrument', _type2:''}},
            forgot_password_email:{method:'GET', params:{_type:'forgot_password_email', _type2:''}},
            set_new_password:{method:'GET', params:{_type:'set_new_password', _type2:''}},
            get_all_works:{method:'GET', params:{_type:'goodworks', _type2:''}}
        });
    }
]);

wegenartServices.factory('Misc', ['$resource','apiHost',
    function($resource, apiHost){
        return $resource(apiHost + '/misc/:_type/:_type2', {}, {
            aboutus: {method: 'GET', params:{_type: 'aboutus'}},
            contactus: {method: 'GET', params:{_type: 'contactus'}},
            joinus: {method: 'GET', params:{_type: 'joinus'}},
            pricesys: {method: 'GET', params:{_type: 'pricesystem'}},
        });
    }
]);

wegenartServices.factory('Teacher', ['$resource','apiHost',
    function($resource, apiHost){
        return $resource(apiHost + '/teacher/:_type/:type2/', {}, {
            calendar:    {method: 'GET', params:{_type: 'calendar', type2: ''}},
            students:    {method: 'GET', params:{_type: 'mystudents', type2: ''}},
            addEvent:    {method: 'POST', params:{_type: 'free_time', type2: 'add'}},
            updateTrackStatus:    {method: 'POST', params:{_type: 'update_track_status', type2: ''}},
            addTrackComment:    {method: 'POST', params:{_type: 'trackcomment', type2: 'add'}},
            textBookList:       {method: 'GET', params:{_type: 'search_textbooks_tracks', type2: ''}},
            addTextbookOrTrack:  {method: 'POST', params:{_type: 'textbook_track', type2:'add'}},
            addLessonComment:    {method: 'POST', params:{_type: 'lessoncomment', type2:'add'}},
            get_setting_profile: {method:'GET', params:{_type:'setting', type2:'profile'}},
            set_setting_profile: {method:'POST', params:{_type:'setting', type2:'profile'}},
            get_setting_record: {method:'GET', params:{_type:'setting', type2:'record'}},
            set_setting_record: {method:'POST', params:{_type:'setting', type2:'record'}},
            get_setting_preferfence: {method:'GET', params:{_type:'setting', type2:'preferfence'}},
            set_setting_preferfence: {method:'POST', params:{_type:'setting', type2:'preferfence'}},
            handleNotice:{method: 'POST', params:{_type: 'notice', type2: ''}},
            header_teachers: {method:'GET', params:{_type:'mystudents', type2:''}},
            header_notices: {method:'GET', params:{_type:'notices', type2:''}},
            header_info: {method:'GET', params:{_type:'headinfo', type2:''}, ignoreLoadingBar: true},
            exchangeinfo: {method:'GET', params:{_type:'exchangeinfo', type2:''}},
            income_detail: {method:'GET', params:{_type:'income_detail', type2:''}},
            withdraw_detail: {method:'GET', params:{_type:'withdraw_detail', type2:''}},
            deleteFreeTime: {method:'POST', params:{_type:'free_time', type2:'delete'}},
            modifyFreeTime: {method:'POST', params:{_type:'free_time', type2:'modify'}},
            requestWithdraw: {method:'POST', params:{_type:'withdraw_request', type2:''}},
            removeStudent:{method:'POST', params:{_type:'remove_relationship', type2:''}},
            get_instrument_list:{method:'GET', params:{_type:'instrumentlist', type2:''}},
            delete_trackcomment:{method:'POST', params:{_type:'delete_trackcomment', type2:''}},
            modify_trackcomment:{method:'POST', params:{_type:'modify_trackcomment', type2:''}}
        });
    }
]);

wegenartServices.factory('Student', ['$resource','apiHost',
    function($resource, apiHost){
        return $resource(apiHost + '/student/:_type/:_type2/', {}, {
            timeline:    {method: 'GET', params:{_type: 'timeline', _type2:''}},
            textbook:    {method: 'GET', params:{_type: 'textbook', _type2:''}},
            track:       {method: 'GET', params:{_type: 'track', _type2:''}},
            profile:     {method: 'GET', params:{_type: 'profile', _type2:''}},
            setprofile:  {method: 'POST',params:{_type: 'setting', _type2:'profile'}},
            teachers:    {method: 'GET', params:{_type: 'myteachers', _type2:''}},
            favteachers: {method: 'GET', params:{_type: 'favoriteteachers', _type2:''}},
            addfav:      {method: 'POST',params:{_type: 'addfavoriteteacher', _type2:''}},
            unfav:       {method: 'POST',params:{_type: 'removefavoriteteacher', _type2:''}},
            teacher:     {method: 'GET', params:{_type: 'detailteacherinfo', _type2:''}},
            bookinfo:    {method: 'GET', params:{_type: 'textbookinfo', _type2:''}},
            courseinfo:  {method: 'GET', params:{_type: 'courseinfo', _type2:''}},
            searchTeachers:   {method: 'GET', params:{_type: 'search', _type2:''}},
            get_setting_record: {method: 'GET', params:{_type: 'setting_record', _type2:''}},
            set_setting_record: {method: 'POST', params:{_type: 'setting_record', _type2:''}},
            teacher_calendar : {method: 'GET', params:{_type: 'teacher_calendar', _type2:''}},
            addEvent : {method: 'POST', params:{_type: 'course', _type2:'elect'}},
            handleNotice:{method: 'POST', params:{_type: 'notice', _type2: ''}},
            lesson_paymentinfo:{method:'GET', params:{_type:'lesson_paymentinfo', _type2:''}},
            header_teachers: {method:'GET', params:{_type:'myteachers', _type2:''}},
            header_notices: {method:'GET', params:{_type:'notices', _type2:''}},
            header_info: {method:'GET', params:{_type:'headinfo', _type2:''}, ignoreLoadingBar: true},
            waitinglist: {method:'GET', params:{_type:'teacher_waitinglist', _type2:''}},
            join_waitinglist:{method:'GET', params:{_type:'join_teacher_waitinglist', _type2:''}},
            check_pay:{method:'GET', params:{_type:'check_pay', _type2:''}},
            removeTeacher:{method:'POST', params:{_type:'remove_relationship', _type2:''}},
            removeReservation:{method:'POST', params:{_type:'course', _type2:'delete'}},
            cancel_trial_request :{method:'GET', params:{_type:'cancel_trial_request', _type2:''}},
            textbooksinfo :{method:'GET', params:{_type:'textbooksinfo', _type2:''}}
        });
    }
]);

// Injects an HTTP interceptor that replaces a "Bearer" authorization header
// with the current Bearer token.
wegenartServices.factory('sessionInjector', ['$cookieStore', 'apiHost',  function($cookieStore, apiHost) {
  return {
    request: function(config) {
      // for post
      if (config.url == apiHost + "/accounts/uploadavatar/") return config;
      if(config.method.toLowerCase()=="post"){
        config.headers = $.extend(config.headers, {'Content-Type': 'application/x-www-form-urlencoded'});
        config.data = $.param(config.data);
      }
      if(!/\.(html|css|js|htm|jpg|png|gif|mp4|webm)$/i.test(config.url)){
        // handle api session
      try {
          var access = {
              "token": $cookieStore.get('token'),
              "uid": $cookieStore.get('uid')
          };
      } catch (err) {
          console.log(err);
      }
        config.params = $.extend(config.params||{}, access);
      }
      
      return config;
    }
  };
}]);

wegenartServices.factory('authorizationService', ["$q", "$rootScope", "$location", '$cookieStore', 'Student', 'Teacher',
  function ($q, $rootScope, $location, $cookieStore, Student, Teacher) {
    return { 
      permissionModel: { permission: {}, isPermissionLoaded: false  },

      permissionCheck: function (roleCollection) {
        var deferred = $q.defer();
        var parentPointer = this;

        //console.log(this.permissionModel);

        if (this.permissionModel.isPermissionLoaded) {
          this.getPermission(this.permissionModel, roleCollection, deferred);
        } else {
          var utype = $cookieStore.get('type');
          utype = (utype === undefined? 3: utype);
          parentPointer.permissionModel.permission = roles.anonymous;

          switch(parseInt(utype,10)){
            case roles.student:
              Student.profile({}, function(data) {
                if(data.errcode==0){
                  parentPointer.permissionModel.permission = roles.student;
                }
                parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);
              }, function(){
                parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);
              });
              break;
            case roles.teacher:
              Teacher.students({}, function(data) {
                if(data.errcode==0){
                  parentPointer.permissionModel.permission = roles.teacher;
                }
                parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);
              }, function(){
                parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);
              });
              break;
            default:
              parentPointer.getPermission(parentPointer.permissionModel, roleCollection, deferred);
          }



        }
        return deferred.promise;
      },

      getPermission: function (permissionModel, roleCollection, deferred) {
        var ifPermissionPassed = false;

        if (permissionModel.permission == roles.superUser){
          ifPermissionPassed = true;
        }else{
          angular.forEach(roleCollection, function (role) {
            switch (role) {
                case roles.superUser:
                  if (permissionModel.permission == roles.superUser) {
                    ifPermissionPassed = true;
                  }
                  break;
                case roles.student:
                  if (permissionModel.permission == roles.student) {
                    ifPermissionPassed = true;
                  }
                  break;
                case roles.teacher:
                  if (permissionModel.permission == roles.teacher) {
                    ifPermissionPassed = true;
                  }
                  break;
                case roles.anonymous:
                  if (permissionModel.permission == roles.anonymous) {
                    ifPermissionPassed = true;
                  }
                  break;
                default:
                  ifPermissionPassed = false;
            }
          });
        };

        if (!ifPermissionPassed) {
          $rootScope.isAuth = false;
          $cookieStore.remove('type');
          $cookieStore.remove('token');
          $cookieStore.remove('uid');
          $location.path(routeForUnauthorizedAccess).replace();
          $rootScope.$on('$locationChangeSuccess', function (next, current) {
            deferred.resolve();
          });
        } else {
          $rootScope.isAuth = true;
          $rootScope.uType = permissionModel.permission;
          deferred.resolve();
        }
      }
    };
  }
]);
