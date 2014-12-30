'use strict';
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('localytics.directives', []);

  angular.module('localytics.directives').directive('chosen', function() {
    var CHOSEN_OPTION_WHITELIST, NG_OPTIONS_REGEXP, isEmpty, snakeCase;
    NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/;
    CHOSEN_OPTION_WHITELIST = ['noResultsText', 'allowSingleDeselect', 'disableSearchThreshold', 'disableSearch', 'enableSplitWordSearch', 'inheritSelectClasses', 'maxSelectedOptions', 'placeholderTextMultiple', 'placeholderTextSingle', 'searchContains', 'singleBackstrokeDelete', 'displayDisabledOptions', 'displaySelectedOptions', 'width'];
    snakeCase = function(input) {
      return input.replace(/[A-Z]/g, function($1) {
        return "_" + ($1.toLowerCase());
      });
    };
    isEmpty = function(value) {
      var key;
      if (angular.isArray(value)) {
        return value.length === 0;
      } else if (angular.isObject(value)) {
        for (key in value) {
          if (value.hasOwnProperty(key)) {
            return false;
          }
        }
      }
      return true;
    };
    return {
      restrict: 'A',
      require: '?ngModel',
      terminal: true,
      link: function(scope, element, attr, ngModel) {
        var chosen, defaultText, disableWithMessage, empty, initOrUpdate, match, options, origRender, removeEmptyMessage, startLoading, stopLoading, valuesExpr, viewWatch;
        element.addClass('localytics-chosen');
        options = scope.$eval(attr.chosen) || {};
        angular.forEach(attr, function(value, key) {
          if (__indexOf.call(CHOSEN_OPTION_WHITELIST, key) >= 0) {
            return options[snakeCase(key)] = scope.$eval(value);
          }
        });
        startLoading = function() {
          return element.addClass('loading').attr('disabled', true).trigger('chosen:updated');
        };
        stopLoading = function() {
          return element.removeClass('loading').attr('disabled', false).trigger('chosen:updated');
        };
        chosen = null;
        defaultText = null;
        empty = false;
        initOrUpdate = function() {
          if (chosen) {
            return element.trigger('chosen:updated');
          } else {
            chosen = element.chosen(options).data('chosen');
            return defaultText = chosen.default_text;
          }
        };
        removeEmptyMessage = function() {
          empty = false;
          return element.attr('data-placeholder', defaultText);
        };
        disableWithMessage = function() {
          empty = true;
          return element.attr('data-placeholder', chosen.results_none_found).attr('disabled', true).trigger('chosen:updated');
        };
        if (ngModel) {
          origRender = ngModel.$render;
          ngModel.$render = function() {
            origRender();
            return initOrUpdate();
          };
          if (attr.multiple) {
            viewWatch = function() {
              return ngModel.$viewValue;
            };
            scope.$watch(viewWatch, ngModel.$render, true);
          }
        } else {
          initOrUpdate();
        }
        attr.$observe('disabled', function() {
          return element.trigger('chosen:updated');
        });
        if (attr.ngOptions && ngModel) {
          match = attr.ngOptions.match(NG_OPTIONS_REGEXP);
          valuesExpr = match[7];
          return scope.$watchCollection(valuesExpr, function(newVal, oldVal) {
            if (angular.isUndefined(newVal)) {
              return startLoading();
            } else {
              if (empty) {
                removeEmptyMessage();
              }
              scope.$$postDigest(stopLoading);
              if (isEmpty(newVal)) {
                return scope.$$postDigest(disableWithMessage);
              }
            }
          });
        }
      }
    };
  });

var wegenartApp = angular.module('wegenartApp', [
    'angular-loading-bar',
    'ngRoute',
    'ngCookies',
    'wegenartControllers',
    'wegenartServices',
    'wegenartFilters',
    'wegenartDirectives',
    'localytics.directives',
    'angularUtils.directives.dirPagination'
]);

// value for api host
wegenartApp.value('apiHost', 'http://127.0.0.1:8000');
var roles = {
    superUser: 2,
    student: 1,
    teacher: 0,
    anonymous: 3
  };
var enum_class_places = {
    both:0,
    teacherHome:1,
    studentHome:2
};

var enum_time_status = {
    used : 0,
    free : 1,
    expired : 2
};
var levelList = [
    '未选择','初级（1级～3级）','中级（4级～7级）','高级（8级～10级）','演奏级','艺考'
];

var languageList = [
          {name: '中文', id:0, checked: true},
          {name: '英语（English）', id:1, checked: false},
          {name: '法语（français）', id:2, checked: false},
          {name: '西班牙语（español）', id:3, checked: false},
          {name: '俄语（русский）', id:4, checked: false},
          {name: '阿拉伯语（العربية）', id:5, checked: false},
          {name: '德语（Deutsch）', id:6, checked: false},
          {name: '日语（日本語）', id:7, checked: false},
          {name: '葡萄牙语（português）', id:8, checked: false},
          {name: '韩语（한국어）', id:9, checked: false},
          {name: '意大利语（lingua italiana）', id:10, checked: false}
        ];
var cancel_relationship_reasons = [[//teacher
          {name: '与学生协商解除关系', value:0, checked: true},
          {name: '对这位学生不满意', value:1, checked: false},
          {name: '对为艺的服务不满意', value:2, checked: false},
          {name: '对价格不满意', value:3, checked: false},
          {name: '其他原因', value:4, checked: false}
        ],[//student
          {name: '与老师协商解除关系', value:0, checked: true},
          {name: '对这位老师不满意', value:1, checked: false},
          {name: '对为艺的服务不满意', value:2, checked: false},
          {name: '对价格不满意', value:3, checked: false},
          {name: '其他原因', value:4, checked: false}
]];
var routeForUnauthorizedAccess = '/signin/';

// router
wegenartApp.config(['$routeProvider', '$locationProvider', '$resourceProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $resourceProvider, $httpProvider){
        $routeProvider.
            // route for three apps
            when('/', {
                controller: 'HomeCtrl',
                templateUrl: 'home.html'
            }).
            when('/signin/', {
                controller: 'SigninCtrl',
                templateUrl: 'signin.html'
            }).
            when('/signout/', {
                controller: 'SignoutCtrl',
                templateUrl: 'signout.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student, roles.teacher]);
                  }
                }
            }).
            when('/search/teacher/', {
                controller: 'SearchTeacherCtrl',
                templateUrl: 'search_teachers.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/student/signup/', {
                controller: 'SignupCtrl',
                templateUrl: 'student/signup_step_1.html'
            }).
            when('/student/noti/', {
                controller: 'StudentNotiCtrl',
                templateUrl: 'student/notifications.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/timeline/', {
                controller: 'StudentTimelineCtrl',
                templateUrl: 'student/timeline.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/textbooks/', {
                controller: 'StudentTextbookCtrl',
                templateUrl: 'student/textbooks.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/tracks/', {
                controller: 'StudentTracksCtrl',
                templateUrl: 'student/repertoires.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/profile/', {
                controller: 'StudentProfileCtrl',
                templateUrl: 'student/info.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/myteachers/', {
                controller: 'StudentMyTeachersCtrl',
                templateUrl: 'student/my_teachers.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/favteachers/', {
                controller: 'StudentMyFavTeachersCtrl',
                templateUrl: 'student/fav_teachers.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/student/teacher/:tid/', {
                controller: 'StudentTeacherDetailCtrl',
                templateUrl: 'student/single_teacher.html',
                resolve: {
                    permission: function (authorizationService, $route) {
                        return authorizationService.permissionCheck([roles.anonymous, roles.student, roles.teacher]);
                    }
                }
            }).
            when('/student/setting/info/', {
                controller: 'StudentSettingInfoCtrl',
                templateUrl: 'student/settings_info.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/teacher/signup/', {
                controller: 'SignupCtrl',
                templateUrl: 'teacher/signup.html'
            }).
            when('/teacher/week/', {
                controller: 'TeacherWeekCtrl',
                templateUrl: 'teacher/week_view.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/week/date/:date', {
                controller: 'TeacherWeekCtrl',
                templateUrl: 'teacher/week_view.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/month/', {
                controller: 'TeacherMonthCtrl',
                templateUrl: 'teacher/month_view.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/month/date/:date', {
                controller: 'TeacherMonthCtrl',
                templateUrl: 'teacher/month_view.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/mystudents/', {
                controller: 'TeacherMyStudentsCtrl',
                templateUrl: 'teacher/students_all.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/:sid/timeline/', {
                controller: 'TeacherStudentTimelineCtrl',
                templateUrl: 'teacher/student_timeline.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/:sid/textbooks/', {
                controller: 'TeacherStudentTextbookCtrl',
                templateUrl: 'teacher/student_textbooks.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/:sid/tracks/', {
                controller: 'TeacherStudentTracksCtrl',
                templateUrl: 'teacher/student_repertoires.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/:sid/profile/', {
                controller: 'TeacherStudentProfileCtrl',
                templateUrl: 'teacher/student_info.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/noti/', {
                controller: 'TeacherNotiCtrl',
                templateUrl: 'teacher/notifications.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/info/', {
                controller: 'TeacherSettingInfoCtrl',
                templateUrl: 'teacher/settings_info.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/experience/', {
                controller: 'TeacherSettingExperienceCtrl',
                templateUrl: 'teacher/settings_experience.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/preference/', {
                controller: 'TeacherSettingPreferenceCtrl',
                templateUrl: 'teacher/settings_preference.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/pay/', {
                controller: 'TeacherSettingPayCtrl',
                templateUrl: 'teacher/settings_pay.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/pay/income/', {
                controller: 'TeacherSettingPayDetailCtrl',
                templateUrl: 'teacher/settings_pay_detail.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/pay/deposit/', {
                controller: 'TeacherSettingWithdrawDetailCtrl',
                templateUrl: 'teacher/settings_withdraw_detail.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/teacher/setting/password/', {
                controller: 'TeacherSettingPasswordCtrl',
                templateUrl: 'teacher/settings_password.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/student/welcome/', {
                templateUrl: 'student/signup_welcome.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.student]);
                  }
                }
            }).
            when('/teacher/welcome/', {
                templateUrl: 'teacher/signup_welcome.html',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher]);
                  }
                }
            }).
            when('/help/', {
                templateUrl: 'help_center.html',
                controller: 'HelpCenterCtrl',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher, roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/joinus/', {
                templateUrl: 'join_us.html',
                controller: 'JoinUsCtrl',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher, roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/aboutus/', {
                templateUrl: 'about_us.html',
                controller: 'AboutUsCtrl',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher, roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/contactus/', {
                templateUrl: 'contact_us.html',
                controller: 'ContactUsCtrl',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher, roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/pricesys/', {
                templateUrl: 'price_system.html',
                controller: 'PriceSystemCtrl',
                resolve: {
                  permission: function (authorizationService, $route) {
                    return authorizationService.permissionCheck([roles.teacher, roles.student, roles.anonymous]);
                  }
                }
            }).
            when('/recover_password/', {
                templateUrl: 'recover_password_1.html',
                controller: 'RecoverPasswordCtrl'
            }).
            when('/resetpassword/', {
                templateUrl: 'reset_password.html',
                controller: 'ResetPasswordCtrl'
            }).
            otherwise({
                redirectTo:'/'
            });

        $locationProvider.html5Mode(true);
        
        /* config ngResource */
        $resourceProvider.defaults.stripTrailingSlashes = false;
        $httpProvider.interceptors.push('sessionInjector');
    }
]);

/* Utils */

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return args[n];
    });
};

Date.prototype.isSameDateAs = function(pDate) {
    return (
        this.getFullYear() === pDate.getFullYear() &&
        this.getMonth() === pDate.getMonth() &&
        this.getDate() === pDate.getDate()
    );
};

Date.prototype.getHM = function() {
    return this.getHours() * 60 + this.getMinutes();
}
Date.prototype.between = function(sDate, eDate) {
    return (
        this.getHM() >= sDate.getHM() && this.getHM() <= eDate.getHM()
    );
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
