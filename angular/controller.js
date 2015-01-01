'use strict';

/* Controllers */

var wegenartControllers = angular.module('wegenartControllers', ['ui.timepicker']);

wegenartControllers.controller('HomeCtrl', ['$rootScope', '$scope', '$routeParams', 'Home', '$cookieStore', 'Account',
    function($rootScope, $scope, $routeParams, Home, $cookieStore, Account){
        var params = {'node_id': 8};
        $scope.treeFamily = {
            name : "Parent",
            children: [{
                name : "Child1",
                children: [{
                    name : "Grandchild1",
                    children: []
                },{
                    name : "Grandchild2",
                    children: [{name: "ggc1"}]
                },{
                    name : "Grandchild3",
                    children: []
                }]
            }, {
                name: "Child2",
                children: []
            }]
        };
        // Home.node_tree(params, function(response) {
        //     $scope.nodes = response;
        //     console.log($scope.nodes);
        // });
        $scope.data = [{
      "id": 1,
      "title": "node1",
      "nodes": [
        {
          "id": 11,
          "title": "node1.1",
          "nodes": [
            {
              "id": 111,
              "title": "node1.1.1",
              "nodes": []
            }
          ]
        },
        {
          "id": 12,
          "title": "node1.2",
          "nodes": []
        }
      ],
    }, {
      "id": 2,
      "title": "node2",
      "nodes": [
        {
          "id": 21,
          "title": "node2.1",
          "nodes": []
        },
        {
          "id": 22,
          "title": "node2.2",
          "nodes": []
        }
      ],
    }, {
      "id": 3,
      "title": "node3",
      "nodes": [
        {
          "id": 31,
          "title": "node3.1",
          "nodes": []
        }
      ],
    }];

    }
]);

wegenartControllers.controller('SigninCtrl', ['$rootScope', '$scope', '$cookieStore', '$location', 'Account', 'authorizationService',
    function($rootScope, $scope, $cookieStore, $location, Account, authorizationService){
        $scope.button = '登录';
        var startLogin = false;
        $scope.login = function($event){
            $event.preventDefault();
            if (startLogin) {
                console.log('already start login');
                return;
            }

            startLogin = true;

            var userinfo = {
                "username": $scope.email,
                "password": $scope.password
            };
            $scope.button = '登录中...';
            Account.signin(
                userinfo,
                function(response) {
                    console.log(response);
                    if (response.errcode) {
                        $scope.button = '登录';
                        $scope.password = "";
                        startLogin = false;
                        $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': response.errmessage});
                        // alert(response.errmessage);
                    } else {
                        $cookieStore.put('token', response.data.token);
                        $cookieStore.put('uid', response.data.uid);
                        $cookieStore.put('type', response.data.type);
                        $cookieStore.put('name', response.data.name);
                        $cookieStore.put('avatar', response.data.avatar_url);

                        authorizationService.permissionModel.isPermissionLoaded = false;

                        if (response.data.type == 0) {
                            // teacher
                            $location.url('/teacher/week/');
                        } else if (response.data.type == 1) {
                            // student
                            var returnurl = $cookieStore.get('streturnurl');
                            if (returnurl) {
                                $cookieStore.remove('streturnurl');
                                $location.url(returnurl);
                            }
                            else if (response.data.has_teacher)
                                $location.url('/student/timeline/');
                            else
                                $location.path("/search/teacher/");
                        }
                    }
                },
                function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                    // alert(error);
                    console.log(error);
                    startLogin = false;
                    $scope.button = '登录';
                }
            );
        }
    }
]);

wegenartControllers.controller('SignoutCtrl', ['$scope', '$cookieStore', '$location', 'Account', '$interval', '$rootScope',
    function($scope, $cookieStore, $location, Account, $interval, $rootScope){
      $scope.msg = '登出中...';
      Account.signout(
          {},
          function(response) {
            $scope.msg = '登出成功，跳转首页...';
            $cookieStore.remove('type');
            $cookieStore.remove('token');
            $cookieStore.remove('uid');
            if (angular.isDefined($rootScope.refresh_header_timer)) {
                $interval.cancel($rootScope.refresh_header_timer);
                $rootScope.refresh_header_timer = undefined;
            }
            console.log('logout');
            $location.path('/');
          },
          function(error) {
            console.log(error);
            $scope.msg = '登出失败，跳转首页...';
            $location.path('/');
          }
      );
    }
]);

wegenartControllers.controller('SearchTeacherCtrl', ['$rootScope', '$scope', '$routeParams', '$cookieStore', 'Student',
    function($rootScope, $scope, $routeParams, $cookieStore, Student){
        var openid = getParameterByName("openid");

        if (openid) {
            $('#wechatshare').show();
        }

        var wxData = {
            "imgUrl": 'http://www.wegenart.com:8000/media/avatar/getheadimg.png',
            "link": 'http://www.wegenart.com/student/signup/?shareopenid='+openid,
            "title": "为艺注册，送学费",
            "desc": "关注为艺公众号，注册送50元学费，分享送10元学费！"
        };

        var wxCallbacks = {
            // 分享操作开始之前
            ready: function() {
                // 你可以在这里对分享的数据进行重组
            },
            // 分享被用户自动取消
            cancel: function(resp) {
                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
            },
            // 分享失败了
            fail: function(resp) {
                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
            },
            // 分享成功
            confirm: function(resp) {
                // 分享成功了，我们是不是可以做一些分享统计呢？
                $.get('http://115.28.234.90:8003/apis/loguseractions/?openid=' + openid + '&action=分享', function(data) {}, 'json');
            },
            // 整个分享过程结束
            all: function(resp) {
                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
            }
        };
        WeixinApi.ready(function(Api) {
            Api.shareToFriend(wxData, wxCallbacks);
            Api.shareToTimeline(wxData, wxCallbacks);
            Api.shareToWeibo(wxData, wxCallbacks);
        });

        $('#wechatshare').bind('touchend', function() {
            setTimeout(function() {
                $('#wechatshare').hide();
            }, 250);
        });

        $scope.keyword = $routeParams.keyword||"";
        $scope.cityList = [
          {name: "北京", pinyin: "beijing", py: "bj"},
          {name: "上海", pinyin: "shanghai", py: "sh"},
          {name: "深圳", pinyin: "shenzhen", py: "sz"},
          {name: "广州", pinyin: "guangzhou", py: "gz"}
        ];
        $scope.point = "北京";
        $scope.showLocationDropdown = false;
        $scope.setLocationDropdown = function(s, $event){
          $event.stopPropagation();
          $scope.showLocationDropdown = s;
        };
        $scope.selectCity = function(city_name){
          $scope.point = city_name;
          setTimeout(function(){
            $scope.$apply(function(){
              $scope.showLocationDropdown = false;
              $scope.searchText = "";
            });
          }, 100);
        };

        $scope.price_ranges = [
            {name:'不限制', value:0},
            {name:'100 - 200 元', value:1},
            {name:'200 - 300 元', value:2},
            {name:'300 - 400 元', value:3},
            {name:'400 - 600 元', value:4},
            {name:'600 - 800 元', value:5},
            {name:'800+ 元', value:6}
        ];

        $scope.distance = "50";
        $scope.rankType = 0;
        $scope.teachpoint = 2;
        $scope.count = 0;
        $scope.price_range = $scope.price_ranges[0];
        $scope.addr_detail = '';

        $scope.instrumentList = [
          {name: '视唱练耳', id:0, checked: true},
          {name: '音基理论', id:1, checked: true},
          {name: '声乐', id:2, checked: true},
          {name: '钢琴', id:3, checked: true},
          {name: '双排键', id:4, checked: true},
          {name: '小提琴', id:5, checked: true},
          {name: '中提琴', id:6, checked: true},
          {name: '大提琴', id:7, checked: true},
          {name: '低音提琴', id:8, checked: true},
          {name: '古典吉他', id:9, checked: true},
          {name: '长笛', id:10, checked: true},
          {name: '单簧管', id:11, checked: true},
          {name: '双簧管', id:12, checked: true},
          {name: '巴松管', id:13, checked: true},
          {name: '手风琴', id:14, checked: true},
          {name: '萨克斯', id:15, checked: true},
          {name: '小号', id:16, checked: true},
          {name: '圆号', id:17, checked: true},
          {name: '长号', id:18, checked: true},
          {name: '大号', id:19, checked: true},
          {name: '打击乐', id:20, checked: true},
          {name: '竖琴', id:21, checked: true},
        ];

        $scope.favTeacher = function(teacher){
          Student.addfav({"teacherid":teacher.innuser_id}, function(data){
            if(data.errcode==0){
              teacher.is_favorite = true;
            }
          });
        }
        
        $scope.unfavTeacher = function(teacher){
          Student.unfav({"teacherid":teacher.innuser_id}, function(data){
            if(data.errcode==0){
              teacher.is_favorite = false;
            }
          });
        }
        
        $scope.submit = function(){
          $scope.keyword = $('#nav-search-input').val().trim();
        }
        
        var firstFlag = true;
        $scope.$watch(
          function(){
            var instrumenttype = [];
            for (var i = 0; i < $scope.instrumentList.length; i++) {
              if($scope.instrumentList[i].checked){
                instrumenttype.push($scope.instrumentList[i].id);
              }
            }
            return {
              keyword: $scope.keyword,
              point: $scope.point + $scope.addr_detail,
              distance: $scope.distance,
              type: $scope.rankType,
              teachpoint: $scope.teachpoint,
              instrumenttype: instrumenttype.join(','),
              price_range: $scope.price_range.value
            }
          },
          function(newValue, oldValue){
            if(newValue!=oldValue || firstFlag){
              firstFlag = false;
                var mark = new Date().getTime();
                $scope.currentReq = mark;
              Student.searchTeachers(newValue, function(data){
                  if ($scope.currentReq != mark) return;
                if(data.errcode=='0'){
                  console.log(data.data);
                  $scope.count = data.data.count;
                  $scope.basicinfo = data.data.baseinfo;
                  $scope.searchedTeachersAll = data.data.searchedteachers;
                }else{
                  console.log(data.errmessage);
                }
              });
            }
          },
          true
        );

        $scope.page = {numPerPage:10, currentPage:1};
    }
]);

wegenartControllers.controller('StudentNotiCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student){
    }
]);

wegenartControllers.controller('StudentSidebarCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student) {
        $scope.openTrackComments = function (id) {
            if ($scope.current_track_id == id) {
                $scope.current_track_id = null;
            } else {
                $scope.current_track_id = id;
            }
        };
    }
]);

wegenartControllers.controller('StudentTimelineCtrl', ['$rootScope', '$scope', 'Student', '$cookieStore', '$routeParams', 'apiHost',
    function($rootScope, $scope, Student, $cookieStore, $routeParams, apiHost){

        $scope.showPurchase1 = false;
        $scope.showPurchase2 = false;
        $scope.showPurchase3 = false;
      
        Student.timeline({}, function(data) {
            console.log(data);
            $scope.alltimeline = data.data.timelineinfo;

            $scope.basicinfo = data.data.baseinfo;
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate($scope.alltimeline));

            $scope.today = new Date();
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
            // alert(error);
            console.log(error);
        });
        $scope.currentTab = 0;
        $scope.timelineTab = 0;

        // scroll to the event
        $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            if ($routeParams.event) {
                var testid = 'event-{0}'.format($routeParams.event);
                var offset = 60 + 25; // header + margin
                var el = document.getElementById(testid);

                if (!el)
                    return

                var top = $(el).offset().top - offset;
                window.scrollTo(0, top);
            }
        });

        $scope.comments = ["非常好，进步很快，加油！",
                           "很好，继续努力，进步很快！",
                           "基本满意，有进步！",
                           "练习不太够，要加油！",
                           "不太满意，要更加努力哦！"];

        
        // sidebar
        $scope.viewSidebar = function(type, id) {
            if (type == 'lesson') {
                Student.courseinfo({"lessonid": id}, function(data) {
                    console.log(data);
                    $scope.lessoninfo = data.data;
                }, function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                    // alert(error);
                    console.log(error);
                });
            } else if (type == 'song') {
                //
            } else if (type == 'textbook') {
                Student.bookinfo({"textbookid": id}, function(data) {
                    console.log(data);
                    $scope.bookinfo = data.data.textbookinfo;
                }, function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':"error"});
                    // alert(error);
                    console.log(error);
                });
            }
            $('#sidebar-{0}'.format(type)).addClass('active');
        };

        $scope.hideSidebar = function(type) {
            $('#sidebar-{0}'.format(type)).removeClass('active');
        };

        $scope.buyBook = function() {
            $scope.showPurchase1 = true;
            $scope.hideSidebar();
        };

        $scope.getDateFromString = function (str) {
            return new Date(str);
        };

        $scope.buyer = {};
        $scope.go_pay = function() {
            var params = $scope.buyer;
            $.extend(params, {'textbook_id': $scope.bookinfo.paymentinfo.id,
                'uid':$cookieStore.get('uid'),
                'token':$cookieStore.get('token')});
            console.log(params);
            var url = apiHost + '/student/textbook_pay/?';
            $.each(params, function(name, value){
                url += name + '=' + value + '&';
            });
            window.open(url);
            $scope.showPurchase1 = false;
            $scope.showPurchase2 = true;
        };

        $scope.pay_finish = function() {
            Student.check_pay({'type':1, 'id':$scope.bookinfo.paymentinfo.id}, function(response){
                if (response.errcode == 0 && response.data.is_paid) {
                    $scope.showPurchase2 = false;
                    $scope.showPurchase3 = true;
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'未购买成功', 'content':"教材未购买成功，请稍后重试！"});
                    // alert("教材未购买成功，请稍后重试！");
                }
            });
        };

        $scope.pay_problem = function() {
            $scope.showPurchase1 = true;
            $scope.showPurchase2 = false;
        };

        // Timeline tab
        $scope.allTimeline = function() {
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate($scope.alltimeline));
            $scope.timelineTab = 0;
        }

        $scope.onlyComments = function() {
            var filtered = $scope.alltimeline.filter(function(el) {
                return (el.type == 1) && (el.state == 0);
            });
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate(filtered));
            $scope.timelineTab = 1;
        }
    }
]);

wegenartControllers.controller('StudentTextbookCtrl', ['$rootScope', '$scope', 'Student', '$location', '$cookieStore', 'apiHost',
    function($rootScope, $scope, Student, $location, $cookieStore, apiHost){
        Student.textbook({}, function(data) {
            console.log(data);
            $scope.basicinfo = data.data.baseinfo;
            $scope.textbooks = data.data.textbooks;
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
            // alert(error);
            console.log(error);
        });
        $scope.currentTab = 1;
        $scope.showPurchase1 = false;
        $scope.showPurchase2 = false;
        $scope.showPurchase3 = false;

        $scope.viewSidebar = function(book) {
            var access = {
                "textbookid": book.id
            };

            Student.bookinfo(access, function(data) {
                console.log(data);
                $scope.bookinfo = data.data.textbookinfo;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });

            $('.sidebar-wrap').addClass('active');
        };

        $scope.hideSidebar = function() {
            $('.sidebar-wrap').removeClass('active');
        };
        $scope.buyBook = function() {
            $scope.showPurchase1 = true;
            $scope.hideSidebar();
        };

        $scope.buyer = {};
        $scope.go_pay = function() {
            var params = $scope.buyer;
            $.extend(params, {'textbook_id': $scope.bookinfo.paymentinfo.id,
                'uid':$cookieStore.get('uid'),
                'token':$cookieStore.get('token')});
            console.log(params);

            var url = apiHost + '/student/textbook_pay/?';
            $.each(params, function(name, value){
                url += name + '=' + value + '&';
            });
            window.open(url);
            $scope.showPurchase1 = false;
            $scope.showPurchase2 = true;
        };

        $scope.pay_finish = function() {
            Student.check_pay({'type':1, 'id':$scope.bookinfo.paymentinfo.id}, function(response){
                if (response.errcode == 0 && response.data.is_paid) {
                    $scope.showPurchase2 = false;
                    $scope.showPurchase3 = true;
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'未购买成功', 'content':"教材未购买成功，请稍后重试！"});
                    // alert("教材未购买成功，请稍后重试！");
                }
            });
        };

        $scope.pay_problem = function() {
            $scope.showPurchase1 = true;
            $scope.showPurchase2 = false;
        };
    }
]);

wegenartControllers.controller('StudentTracksCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student){
        Student.track({}, function(data) {
            console.log(data);
            $scope.basicinfo = data.data.baseinfo;
            $scope.tracklist = data.data.tracklist;
            $scope.count = data.data.count;
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
            // alert(error);
            console.log(error);
        });
        $scope.currentTab = 2;
    }
]);

wegenartControllers.controller('StudentProfileCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student){
        Student.profile({}, function(data) {
            console.log(data);
            $scope.basicinfo = data.data.baseinfo;
            $scope.profile = data.data.profileinfo[0];
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
            // alert(error);
            console.log(error);
        });
        $scope.currentTab = 3;
    }
]);

wegenartControllers.controller('StudentMyTeachersCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student){
        $scope.favTeacher = function(tid) {
            Student.addfav({"teacherid":tid}, function(data) {
                console.log(data);

                var i = 0;
                for (i in $scope.teachers) {
                    var obj = $scope.teachers[i];
                    if (obj.id == tid) {
                        break;
                    }
                }

                $scope.teachers[i].is_favorite = true;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };

        $scope.unFavTeacher = function(tid) {
            Student.unfav({"teacherid":tid}, function(data) {
                console.log(data);

                var i = 0;
                for (i in $scope.teachers) {
                    var obj = $scope.teachers[i];
                    if (obj.id == tid) {
                        break;
                    }
                }

                $scope.teachers[i].is_favorite = false;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };
        $scope.showCancelRelationshipFeedbackModal = false;
        $scope.reasons = cancel_relationship_reasons[roles.student];
        $scope.reasonSelect = $scope.reasons[0];
        $scope.reasonDetail = '';

        $scope.changehappened = function(data){
            $rootScope.$emit('reasonselected', data);
        };
        $rootScope.$on('reasonselected', function(evt, data){
            $scope.reasonSelect = data;
        });

        $scope.removeTeacher = function(teacher) {
            $scope.teacherToRemove = teacher;
            $scope.showCancelRelationshipFeedbackModal = true;
        }

        $scope.removeRelationship = function() {
            var teacher = $scope.teacherToRemove;
            if (teacher == undefined) return;
            if ($scope.reasonSelect.value == $scope.reasons[$scope.reasons.length - 1].value) { //other reason
                if (!$scope.reasonDetail || $scope.reasonDetail == '') {
                    $scope.showCancelRelationshipFeedbackModal = false;
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请输入具体原因',
                    'clickPositive':function(){
                        $scope.showCancelRelationshipFeedbackModal = true;
                    }});
                    return;
                }
            }
            var params = {'teacher_id':teacher.id};
            $.extend(params, {'reason':$scope.reasonSelect.value});
            $.extend(params, {'description':$scope.reasonDetail});
            Student.removeTeacher(params, function(response){
                 if (response.errcode == 0) {
                    teacher.deleted = true;
                    for (var i = 0; i < $scope.teachers; i ++) {
                        if ($scope.teachers[i].id == teacher.id) {
                            $scope.teachers.splice(i, 1);
                            return;
                        }
                    }
                    $scope.showCancelRelationshipFeedbackModal = false;
                 } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                 // alert(response.errmessage);
            });
        };
    }
]);

wegenartControllers.controller('StudentMyFavTeachersCtrl', ['$rootScope', '$scope', 'Student',
    function($rootScope, $scope, Student){
        $scope.unFavTeacher = function(tid) {
            Student.unfav({"teacherid":tid}, function(data) {
                console.log(data);

                var i = 0;
                for (i in $scope.favteachers) {
                    var obj = $scope.favteachers[i];
                    if (obj.id == tid) {
                        break;
                    }
                }

                $scope.favteachers.splice(i, 1);
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };

        Student.favteachers({}, function(data) {
            console.log(data);
            $scope.favteachers = data.data.favoriteteachers;
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
            // alert(error);
            console.log(error);
        });
    }
]);

wegenartControllers.controller('StudentMonthCtrl', ['$rootScope', '$scope', '$routeParams', 'Student', '$cookieStore',
    function($rootScope, $scope, $routeParams, Student, $cookieStore) {
        var wgcalendar = WGCalendar();

        $scope.today = function () {
            $scope.date = wgcalendar.firstMonthDay(new Date());
            $scope.fetchData();
        };

        $scope.previousMonth = function () {
            $scope.date.setMonth($scope.date.getMonth() - 1);
            $scope.fetchData();
        };

        $scope.nextMonth = function () {
            $scope.date.setMonth($scope.date.getMonth() + 1);
            $scope.fetchData();
        };

        $scope.showPopup = function (cell, coordinate) {
            console.log(cell);
            var x = coordinate.x;
            var y = coordinate.y;
            var cell_width = $('td').width();
            var cell_height = 161;

            var top = x * cell_height + 15;
            var left = (y + 1) * cell_width;

            var params = {
                free: cell.free,
                busy: cell.busy,
                date: cell.date,
                position: {left: left, top: top},
                showsRepeat: !$scope.trial,
                student_class_home: $scope.student_class_home
            };

            $scope.$broadcast('toggleReservationPopup', params);
            //$('#popup-answer').css({left: left + 'px', top: top + 'px'});
        };

        $scope.fetchData = function () {
            $scope.date = $scope.date ? wgcalendar.firstMonthDay($scope.date) : wgcalendar.firstMonthDay(new Date());
            $scope.data = wgcalendar.renderCalendar($scope.date);
            var start = wgcalendar.dateFormat($scope.date, "yyyy-mm-dd");
            var end = wgcalendar.dateFormat(wgcalendar.lastMonthDay($scope.date), "yyyy-mm-dd");
            Student.teacher_calendar({'start':start, 'end':end, 'teacher_id':$routeParams.tid}, function (response) {
                console.log(response);
                $scope.data = wgcalendar.renderCalendarItems($scope.date, response.data.teacher_calendar, $scope.data);
                $scope.student_class_home = response.data.student_class_home;
            });
        };

        $scope.$on('didSubmitReservation', function (event, params) {
            var lesson_type = $scope.trial ? 6 : 7;
            $.extend(params, {'type': lesson_type, 'teacher_id': $routeParams.tid});
            Student.addEvent(params, function(data) {
                console.log(data);
                $scope.dismiss();
                if (data.errcode == 0) {
                    $scope.fetchData();
                    if(lesson_type == 6)
                        $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content': "预约试课请求已经发送成功，请等待老师的回复。"});
                } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': data.errmessage});
            }, function(error) {
                $scope.dismiss();
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                console.log(error);
            });
        });

        $scope.$on('bookTeacher', function (event, trial) {
            console.log('recv book teacher');
            $scope.trial = trial.trial;
            $scope.today();
        });

        $scope.$on('didCancelReservation', function(event) {
            $scope.fetchData();
        });

        $scope.dismiss = function () {
            $scope.$broadcast('dismissReservationPopup');
        };

        $scope.showTrialRequest = false;
        $scope.trial_id = null;
        $scope.cancelTrialRequest = function() {
            $scope.showTrialRequest = false;
            var params = {
                "trial_id": $scope.trial_id
            };
            Student.cancel_trial_request(params, function(data) {
                $scope.fetchData();
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
            });
        };

        $scope.hideTrialRequest = function() {
            $scope.showTrialRequest = false;
        };

        $scope.clickReservationItem = function(item) {
            if (item.lesson_info.status == 5) {
                $scope.trial_id = item.lesson_info.id;
                $scope.showTrialRequest = true;
            }
            else {
                $scope.dismiss();
                $scope.$broadcast('viewSidebar', item.lesson_info.id, 'lesson', '', true, item.lesson_info.can_cancel);
            }
        };

        //$scope.today();
    }
]);

wegenartControllers.controller('StudentWeekCtrl', ['$rootScope', '$scope', '$routeParams', 'Student', '$cookieStore',
    function($rootScope, $scope, $routeParams, Student, $cookieStore) {

        $scope.wgcalendar = WGCalendar();
        $scope.todaydate = new Date();
        $scope.date = $scope.wgcalendar.getMonday($scope.todaydate);
        var data = [[], [], [], [], [], [], []];
        $scope.data = data;

        $scope.redrawWeekCalendar = function() {
            $scope.weekDate = [];
            var isToday = [];
            var weekdays = ['一', '二','三','四','五','六','日'];
            for (var i = 0; i < 7; i++) {
                var d = new Date($scope.date.getTime());
                d.setDate(d.getDate() + i);
                $scope.weekDate.push({
                    date: d,
                    day: weekdays[i]
                });
                if (d.isSameDateAs(new Date()))
                    isToday.push(true);
                else
                    isToday.push(false);
            }
            $scope.isToday = isToday;
            $scope.fetchData();
        };

        $scope.fetchData = function () {
            $scope.date = $scope.wgcalendar.getMonday($scope.date);
            var start = $scope.wgcalendar.dateFormat($scope.date, "yyyymmdd");
            var end = new Date($scope.date.getTime());
            end.setDate(end.getDate() + 6);
            end = $scope.wgcalendar.dateFormat(end, "yyyymmdd");

            var data = [[], [], [], [], [], [], []];
            $scope.data = data;

            Student.teacher_calendar({'start':start, 'end':end, 'teacher_id':$routeParams.tid}, function (response) {
                $scope.data = $scope.wgcalendar.renderWeekItems($scope.date, response.data.teacher_calendar, $scope.data);
                $scope.student_class_home = response.data.student_class_home;
            });
        };

        $scope.today = function () {
            $scope.date = $scope.wgcalendar.getMonday($scope.todaydate);
            $scope.redrawWeekCalendar();
            return $scope.todaydate;
        };

        $scope.previousWeek = function () {
            $scope.date.setDate($scope.date.getDate() - 7);
            $scope.redrawWeekCalendar();
        };

        $scope.nextWeek = function () {
            $scope.date.setDate($scope.date.getDate() + 7);
            $scope.redrawWeekCalendar();
        };

        $scope.$on('bookTeacher', function (event, trial) {
            $scope.trial = trial.trial;
            console.log('recv trial=' + $scope.trial);
            $scope.today();
        });

        $scope.$on('didDismissPopup', function (event) {
            var coordinate = $scope.coordinate;
            if (coordinate) {
                $scope.data[coordinate.x].splice(coordinate.y, 1);
                $scope.coordinate = null;
            }
        });

        $scope.$on('didChangeNewReservationDate', function (event, data) {
            if ($scope.coordinate) {
                var item = $scope.data[$scope.coordinate.x][$scope.coordinate.y];
                item.start_date = data.startDate;
                item.end_date = data.endDate;

                // change position
                var top = data.startDate.getHours() * 2 - 13 + data.startDate.getMinutes() / 30.0;
                top = (top - 0.5) * 40;
                $scope.$broadcast('didChangePopupTop', {top: top});
            }
        });

        $scope.showTrialRequest = false;
        $scope.showCompleteProfile = false;
        $scope.trial_id = null;
        $scope.cancelTrialRequest = function() {
            $scope.showTrialRequest = false;
            var params = {
                "trial_id": $scope.trial_id
            };
            Student.cancel_trial_request(params, function(data) {
                $scope.fetchData();
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
            });
        };

        $scope.hideTrialRequest = function() {
            $scope.showTrialRequest = false;
        };

        $scope.hideCompleteProfile = function() {
            $scope.showCompleteProfile = false;
        }

        $scope.editItemInfo = function(index, item) {
            //$scope.dismiss();
            if (item.lesson_info.status == 5) {
                $scope.trial_id = item.lesson_info.id;
                $scope.showTrialRequest = true;
            }
            else
                $scope.$broadcast('viewSidebar', item.lesson_info.id, 'lesson', '', true, item.lesson_info.can_cancel);
        };

        $scope.dismiss = function () {
            $scope.$broadcast('dismissReservationPopup');
        };

        $scope.$on('didCancelReservation', function(event) {
            $scope.redrawWeekCalendar();
        });
        $scope.$on('didSubmitReservation', function (event, params) {
            var lesson_type = $scope.trial ? 6 : 7;
            $.extend(params, {'type': lesson_type, 'teacher_id': $routeParams.tid});
            Student.addEvent(params, function(data) {
                $scope.dismiss();
                if (data.errcode == 0) {
                    if ($scope.coordinate) {
                        var item = $scope.data[$scope.coordinate.x][$scope.coordinate.y];
                        item.status = 0;
                        $scope.coordinate = null;
                        if(lesson_type == 6)
                            $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content': "预约试课请求已经发送成功，请等待老师的回复。"});
                    }
                    $scope.$broadcast('dismissReservationPopup');

                    $scope.redrawWeekCalendar();
                }
                else if (data.errcode == 2) {
                    $scope.showCompleteProfile = true;
                }else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': data.errmessage});
            }, function(error) {
                $scope.dismiss();
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                console.log(error);
            });
        });

        $scope.addEventOnGrid = function (event, column) {
            if ($scope.coordinate) {
                $scope.$broadcast('dismissReservationPopup');
                return;
            }

            var box_h = 40;
            // var height = 2; // 60 min
            var height = $scope.trial ? 1 : 2;
            var top = Math.floor((event.pageY - $('.week-days-container').offset().top) / box_h);
            console.log('add event on grid' + top + "," + column);

            var startDate = new Date(0);
            startDate.setTime(startDate.getTimezoneOffset() * 60000);
            startDate.setHours(startDate.getHours() + 6);
            startDate.setMinutes(startDate.getMinutes() + top * 30 + 30);

            var endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + height * 30);

            var lesson_status = $scope.trial ? 'trial' : 'planned' ;
            console.log('lesson_status' + lesson_status);
            var item = {
                name: $cookieStore.get('name'),
                avatar: $cookieStore.get('avatar'),
                start_date: startDate,
                end_date: endDate,
                duration: Math.round((endDate - startDate)/3600/100)/10,
                lesson_info: {
                    lesson_status: lesson_status
                },
                status: 99
            };

            var idx = $scope.data[column].push(item);
            $scope.coordinate = {
                x: column,
                y: idx - 1
            };


            var selected_day = new Date($scope.date.getTime());
            selected_day.setDate(selected_day.getDate() + column);

            var free = $.grep($scope.data[column], function (d) {
                return d.status == 1 && startDate.between(d.start_date, d.end_date);
            });
            var busy = false;
            $.each(free, function(i, v) {
                console.log(v.start_date.getHours() + " " + v.start_date.getMinutes());
                var s = v.start_date.getHours() * 100 + v.start_date.getMinutes();
                var e = v.end_date.getHours() * 100 + v.end_date.getMinutes();
                var t = startDate.getHours() * 100 + startDate.getMinutes();
                if (s <= t && e > t) busy = true;
                console.log(startDate.getHours() + " " + startDate.getMinutes());
            });

            var params = {
                busy: busy,
                free: free,
                date: selected_day,
                newEvent: {
                    startDate: startDate,
                    endDate: endDate,
                    shouldRepeatEvent: !$scope.trial
                },
                position: {left: $('.week-days-container > .day-item').width() * (column + 1), top: (top - 0.5) * box_h},
                showsRepeat: !$scope.trial,
                student_class_home: $scope.student_class_home
            };
            console.log('params.showsRepeat' + params.showsRepeat);
            $scope.$broadcast('showReservationPopup', params);
        };

//        $scope.today();
    }
]);

wegenartControllers.controller('StudentTeacherDetailCtrl', ['$rootScope', '$scope', '$routeParams', 'Student', 'Teacher', '$cookieStore',
    function($rootScope, $scope, $routeParams, Student, Teacher, $cookieStore){
        $scope.currentTab = 'week';
        $scope.changeTab = function (tab) {
            $scope.currentTab = tab;
        };

        var params = {
            "teacherid": $routeParams.tid
        };

        $scope.shortUniversities = false;
        $scope.shortGoodWorks = false;
        $scope.shortAllAwards = false;
        $scope.shortAllStudentAwSards = false;
        $scope.shortAllEverJobs = false;

        Student.teacher(params, function(data) {
            console.log(data);
            $scope.detail = data.data.detailteacherinfo;
            $scope.calendar = data.data.teacher_calendar;
            $scope.universities = $scope.detail.graduated_university.slice(0, 2);
            $scope.awards = $scope.detail.awardlist.slice(0, 2);
            $scope.goodworks = $scope.detail.goodworks;
            $scope.student_awards = $scope.detail.student_awardlist.slice(0, 2);
            $scope.positions = $scope.detail.positions.slice(0, 2);
            $scope.allUniversities = false;
            $scope.allAwards = false;
            $scope.allStudentAwards = false;
            $scope.allPositions = false;

            if($scope.detail.graduated_university.length <= 2) {
                $scope.shortUniversities = true;
            }
            if($scope.detail.goodworks.length <= 2) {
                $scope.shortGoodWorks = true;
            }
            if($scope.detail.awardlist.length <= 2) {
                $scope.shortAllAwards = true;
            }
            if($scope.detail.student_awardlist.length <= 2) {
                $scope.shortAllStudentAwSards = true;
            }
            if($scope.detail.positions.length <= 2) {
                $scope.shortPositions = true;
            }
            
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
            // alert(error);
            console.log(error);
        });

        // toggle awards
        $scope.toggleAwards = function() {
            $scope.allAwards = !$scope.allAwards;

            if ($scope.allAwards) {
                $scope.awards = $scope.detail.awardlist;
            } else {
                $scope.awards = $scope.detail.awardlist.slice(0, 2);
            }
        };

        // toggle universities
        $scope.toggleUniversity = function() {
            $scope.allUniversities = !$scope.allUniversities;

            if ($scope.allUniversities) {
                $scope.universities = $scope.detail.graduated_university;
            } else {
                $scope.universities = $scope.detail.graduated_university.slice(0, 2);
            }
        };


        // toggle student_awards
        $scope.toggleStudentAwards = function() {
            $scope.allStudentAwards = !$scope.allStudentAwards;

            if ($scope.allStudentAwards) {
                $scope.student_awards = $scope.detail.student_awardlist;
            } else {
                $scope.student_awards = $scope.detail.student_awardlist.slice(0, 2);
            }
        };

        // toggle positions
        $scope.togglePositions = function() {
            $scope.allPositions = !$scope.allPositions;

            if ($scope.allPositions) {
                $scope.positions = $scope.detail.positions;
            } else {
                $scope.positions = $scope.detail.positions.slice(0, 2);
            }
        };

        // add this teacher to my favorite teacher
        $scope.favTeacher = function(teacher) {
            if ($rootScope.needAuth(roles.student)) return;
            Student.addfav({"teacherid":teacher.id}, function(data) {
                console.log(data);

                teacher.is_favorite = true;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };

        // remove this teacher to my favorite teacher
        $scope.unFavTeacher = function(teacher) {
            Student.unfav({"teacherid":teacher.id}, function(data) {
                console.log(data);

                teacher.is_favorite = false;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };

        $scope.showsReservationCalendar = false;
        $scope.bookTeacher = function() {
            if ($rootScope.needAuth(roles.student)) return;//TODO
            console.log('will book teacher, is_trial=' + !$scope.detail.is_mystudent);

            $scope.$broadcast('bookTeacher', {trial:!$scope.detail.is_mystudent});

            $scope.showsReservationCalendar = true;
        };

        $scope.showReservationConfirm1=false;
        $scope.showReservationConfirm2=false;
        $scope.joinReservationLine = function() {
            if ($rootScope.needAuth(roles.student)) return;
            $scope.showReservationConfirm1 = true;
        };

        $scope.reserve1_cancel = function() {
            $scope.showReservationConfirm1 = false;
        };

        $scope.reserve2_cancel = function() {
            $scope.showReservationConfirm2 = false;
        };

        Student.waitinglist({'teacher_id':$routeParams.tid}, function(resp) {
            console.log(resp);
            $scope.teacher_name = resp.data.teacher_name;
            $scope.waiting_count = resp.data.waiting_count;
        });

        $scope.reserve1_confirm = function() {
            Student.join_waitinglist({'teacher_id':$routeParams.tid}, function (resp) {
                $scope.teacher_name = resp.data.teacher_name;
                $scope.waiting_count = resp.data.waiting_count;
                $scope.showReservationConfirm1=false;
                $scope.showReservationConfirm2=true;
            });
        };
    }
]);

wegenartControllers.controller('StudentSettingInfoCtrl', ['$rootScope', '$scope', 'Student', 'fileUpload', 'Account', 'Teacher',
    function($rootScope, $scope, Student, fileUpload, Account, Teacher){
        $scope.currentTab = 0;
        $scope.addr_city = "北京";
        $scope.setting_info = function(val) {
           $scope.currentTab = val;
        };
        $scope.levelList = levelList;
        //calendar adaption
        uiutils.setup_day_selector();
        uiutils.upload_avatar(fileUpload, $rootScope, $scope);

        $('.input-cert').change(function() {//TODO
            $('.upload-cert').html("上传中...");
            fileUpload.uploadFileToUrl($(this)[0].files[0], function(response) {
                console.log('upload resp');
                console.log(response);
                if (response.errcode > 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':"上传失败"});
                   // alert("上传失败");
                    $('.upload-cert').html("上传获奖证书");
                    return;
                }
                $scope.currentAwardCertID = response.data.avatar_id;
                $scope.cert_url = response.data.avatar_url;
                $('.upload-cert').html("已上传获奖证书");
            }, function(resp) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':resp});
                // alert(resp);
            });
            return false;
        });

        $scope.confirm_changes1 = function() {
            var data = {
                'name' : $('#name').val(),
                'nickname' : $('#nickname').val(),
                'gender' : $('input[name="repetition"]:checked').val() || 2,
                'birthday': $('select[name="birth-year"]').val() + '-' + $('select[name="birth-month"]').val() + '-' + $('select[name="birth-day"]').val(),
                'addr': $scope.addr_city + $scope.addr_detail,
                'parent': $('#parentname').val()
            };

            if (!$scope.addr_city || !$scope.addr_detail) {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请完整填写家庭地址'});
                return;
            }

            if ($scope.avatar_id) {
                $.extend(data, {'avatar' : $scope.avatar_id});
            }
            Student.setprofile(data, function(response) {
                console.log(response);
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
                // if (response.errcode == 0) alert('修改成功');
                // else alert(response.errmessage);
            });
        };

        var wgcalendar = new WGCalendar();
        $scope.confirm_changes2 = function() {//TODO
            var tins = [];
            $.each($scope.insInfoList, function(i, v){
                tins.push(v.ins+'/'+ v.age+'/'+ v.level);
            });
            var instruments = tins.join('$');
            console.log('instruments:' + instruments);

            var tawards = [];
            $.each($scope.awardList, function(i, v){
                tawards.push(v.award_name + '/' + v.award_result + '/' + v.award_year + '/' + v.pic_id);
            });
            var awards = tawards.join('$');
            console.log('awards:' + awards);

            console.log($scope.goodats);
            var goodats= $scope.goodats.join('$');
            console.log('goodats:' + goodats);
            var data = {
                'goodat' : goodats,
                'instrument': instruments,
                'award' : awards
            };
            if ($scope.cert_id) {
                $.extend(data, {'avatar' : $scope.avatar_id});
            }
            Student.set_setting_record(data, function(response) {
                console.log(response);
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功！'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
                // if (response.errcode == 0) alert('修改成功');
                // else alert(response.errmessage);
            });
        };

        $scope.oldpwd = '';
        $scope.newpwd = '';
        $scope.newpwd2 = '';
        $scope.confirm_changes3 = function() {
            if ($scope.newpwd == $scope.newpwd2) {
                Account.changePWD({'oldpassword':$scope.oldpwd, 'newpassword':$scope.newpwd}, function(response) {
                    console.log(response);
                    // if (response.errcode == 0) {
                    //     alert('修改成功');
                    //     $scope.oldpwd = '';
                    //     $scope.newpwd = '';
                    //     $scope.newpwd2 = '';
                    // }
                    // else alert(response.errmessage);
                    if (response.errcode == 0) {
                        $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功'});
                        $scope.oldpwd = '';
                        $scope.newpwd = '';
                        $scope.newpwd2 = '';
                    } else {
                        $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                    }
                });
            } else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'新密码两次输入不一致'});
                // alert("新密码两次输入不一致");
            }
        };

        $scope.add_music = function(value1, value2) {
            if (value1 == "" || value1 == undefined || value2 == "" || value2 == undefined) return;
            var value = value1 + "/" + value2;

            uiutils.add_setting_item_value(value, $('#music-container .settings-list'));
        };
        $('#add_score').click(function() {
            uiutils.add_setting_item($('input[name="score"]'), $('#score-container .settings-list'));
        });
        $('#add_music').click(function() {
            var value1 = $('input[name="music-name"]').val();
            var value2 = $('input[name="music-position"]').val();
            $('input[name="music-name"]').val('');
            $('input[name="music-position"]').val('');
            $scope.add_music(value1, value2);
        });
        $('#add_goodat').click(function() {
            uiutils.add_setting_item($('input[name="goodat"]'), $('#goodat-container .settings-list'));
        });
        Student.profile({}, function(response){
            console.log(response);
            $scope.profileinfo = response.data.profileinfo[0];
            if ($scope.profileinfo.location && $scope.profileinfo.location.length > 2) {
                $scope.addr_detail = $scope.profileinfo.location.substring(2);
                $scope.addr_city = $scope.profileinfo.location.substring(0, 2);
            }
            $.each($('input[name="repetition"]'), function(i, v) {
               if ($(v).attr('value') == $scope.profileinfo.gender) $(v).attr('checked', true);
            });
        });
        //works
        Account.get_all_works({}, function(response){
            if (response.errcode == 0) {
                $scope.allworks = response.data;
            }
        });
        Student.get_setting_record({}, function(response) {
            console.log(response);
            var data = response.data;
            $scope.insInfoList = [];
            $.each(data.instruments, function(i, v) {
                $scope.insInfoList.push({
                    'ins':v.musical_instrument,
                    'level': v.level,
                    'age': v.how_long
                });
            });
            $scope.awardList = data.awards;

            $scope.goodats = [];
            $.each(data.goodtrades, function(i, v) {
                $scope.goodats.push(v.trade);
            });
//            if ($scope.goodats.length == 1) $scope.goodats = $scope.goodats[0];
            console.log($scope.goodats);
        });
        //instrument
        $scope.defaultIns = {'ins':undefined, 'level':0, age:''};
        $scope.tempIns = angular.copy($scope.defaultIns);
        $scope.insInfoList = [];
        Teacher.get_instrument_list({}, function(response){
             if (response.errcode == 0) {
                 $scope.instrumentList = response.data;
             }
        });

        $scope.addIns = function() {
            if ($scope.tempIns.ins != 'default' && $scope.tempIns.level > 0 && $scope.tempIns.age != '') {
                $scope.insInfoList.push(angular.copy($scope.tempIns));
                $scope.tempIns = angular.copy($scope.defaultIns);
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };

        $scope.deleteIns = function(index) {
            $scope.insInfoList.splice(index, 1);
        };

        $scope.year_list = [];
        for (var i = 2020; i >= 1970; i--) {
            $scope.year_list.push(i);
        }

        $scope.month_list = [];
        for (var i = 12; i >= 1; i--) {
            $scope.month_list.push(i);
        }

        //awards
        $scope.awardList = [];
        $scope.currentAward = undefined;
        $scope.currentAwardCertID = undefined;
        $scope.currentAwardResult = undefined;
        $scope.currentAwardYear = undefined;
        $scope.addAward = function() {
            $scope.currentAwardYear = $('select[name="award-year"]').val() + '-' + $('select[name="award-month"]').val();
            if ($scope.currentAward && $scope.currentAwardCertID && $scope.currentAwardResult && $('select[name="award-year"]').val() && $('select[name="award-month"]').val()) {
                $scope.awardList.push({
                    'award_name': $scope.currentAward,
                    'pic_id': $scope.currentAwardCertID,
                    'award_result': $scope.currentAwardResult,
                    'award_year':  $scope.currentAwardYear,
                });
                $scope.currentAward = undefined;
                $scope.currentAwardCertID = undefined;
                $scope.currentAwardResult = undefined;
                $scope.cert_url = undefined;
                $scope.currentAwardYear = undefined;
                $('.upload-cert').html("上传获奖证书");
                $('select[name="award-year"]').val($("select[name='award-year'] option:first").val());
                $('select[name="award-month"]').val($("select[name='award-month'] option:first").val());
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };

        $scope.deleteAward = function(index) {
            $scope.awardList.splice(index, 1);
        };
        
    }
]);

wegenartControllers.controller('TeacherNotiCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
    }
]);

wegenartControllers.controller('TeacherSidebarCtrl', ['$rootScope', '$scope', 'Teacher', 'Student', '$element',
    function($rootScope, $scope, Teacher, Student, $element) {
        $scope.submitReviewStatus = "完成布置";
		$scope.coursesList = null;
        $scope.currentModifyComment = {};

        $scope.showSideBarFunc = function(event, id, type, sid, isStudent, can_cancel, isAddTextbook) {
		  $scope.reviewContent = "";
          if(!$element.hasClass(type)) return;
          if (isStudent && isStudent === true) $scope.isStudent = true;
          else $scope.isStudent = false;
          if (can_cancel && can_cancel === true) $scope.can_cancel = true;
          else $scope.can_cancel = false;
          if (isAddTextbook && isAddTextbook === true) $scope.isAddTextbook = true;
          else $scope.isAddTextbook = false;
          if (type == 'lesson') {
              if (isAddTextbook) {
                  Student.textbooksinfo({'student_id':sid}, function(data){
                      console.log(data);
                      $scope.lessoninfo = data.data;
                      $scope.student_id = sid;
                      $scope.current_avatar = data.data.current_avatar;
                  });
              } else {
                  Student.courseinfo({"lessonid": id}, function(data) {
                      console.log(data);
                      $scope.lessonid = id;
                      $scope.lessoninfo = data.data;
                  });
              }
          } else if (type == 'textbook' && sid !=undefined ) {
              Student.bookinfo({"textbookid": id, 'studentid': sid}, function(data) {
                  console.log(data);
                  $scope.current_avatar = data.data.current_avatar;
                  $scope.bookinfo = data.data.textbookinfo;
              });
          }
          $('.sidebar-wrap.'+type).addClass('active');
        };
        $scope.$on('viewSidebar', $scope.showSideBarFunc);

        $scope.getDateFromString = function (str) {
            return new Date(str);
        };

        $scope.showChooseDeleteReservationOption = false;
        $scope.cancelReservation = function(type) {
            Student.removeReservation({'lesson_id': $scope.lessonid, 'type':type}, function(response){
                if (response.errcode == 0) {
                    $scope.showChooseDeleteReservationOption = false;
                    $scope.$emit('didCancelReservation');
                } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                // alert(response.errmessage);
            });
        };
        $scope.hideSidebar = function(type) {
            $scope.showsCourseAdd = false;
            $('.sidebar-wrap.'+type).removeClass('active');
        };

        $scope.showCourseAddPanel = function () {
            $scope.showsCourseAdd = true;
			$scope.coursesList = [];
			Teacher.textBookList({}, function(data){
				if(data.errcode==0){
					console.log(data.data);
					$scope.coursesList = data.data;
				}else{
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':data.errmessage});
					// alert(data.errmessage);
				}
			});
        };

        $scope.hideCourseAddPanel = function () {
            $scope.showsCourseAdd = false;
        };
				
		$scope.selectBookorTrack = function(id, type){
			Teacher.addTextbookOrTrack({
				type: type,
				id: id,
				lesson_id: $scope.lessonid || $scope.lessoninfo.bookinfo.lesson_id,
                student_id:$scope.student_id || ''
			}, function(data){
				if(data.errcode==0){
                    // $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':response.errmessage});
					// alert('添加成功');
                    
					$scope.hideCourseAddPanel();
                    if ($scope.lessonid) {
                        Student.courseinfo({"lessonid": $scope.lessoninfo.bookinfo.lesson_id}, function(data) {
                            $scope.lessoninfo = data.data;
                        });
                    }
                    else {
                        Student.textbooksinfo({'student_id': $scope.student_id}, function(data){
                          $scope.lessoninfo = data.data;
                        });
                    }
                    $rootScope.$broadcast('fetchTextbooks');
				}else{
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':'添加失败:'+data.errmessage});
					// alert('添加失败:'+data.errmessage);
				}
			})
		};
		
		$scope.comments = ["非常好，进步很快，加油！",
						   "很好，继续努力，进步很快！",
						   "基本满意，有进步！",
						   "练习不太够，要加油！",
						   "不太满意，要更加努力哦！"];
        $scope.evaluation = 0;
        $scope.oldevaluation = 0;
        $scope.star_click = function(p) {
            $scope.evaluation = p + 1;
            $scope.oldevaluation = $scope.evaluation;
        };
        $scope.star_mon = function(p) {
            $scope.oldevaluation = $scope.evaluation;
            $scope.evaluation = p + 1;
        };
        $scope.star_moff = function(p) {
            $scope.evaluation = $scope.oldevaluation;
        };
        
        $scope.submitReview = function(){
            if(!$scope.reviewContent){
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'错误:请输入评价内容'});
                // alert('错误:请输入评价内容');
            }else if(!$scope.evaluation){
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'错误:请选择评分'});
            	// alert('错误:请选择评分');
            }else {
                $rootScope.$broadcast('showConfirmTwoModal', {
                    'title':'提示',
                    'content':'确认提交吗？',
                    clickPositive:function() {
                        $scope.submitReviewStatus = "发布中...";
                        Teacher.addLessonComment({
                            lesson_id: $scope.lessoninfo.bookinfo.lesson_id,
                            evaluation: $scope.evaluation,
                            comment: $scope.reviewContent
                        }, function(data){
                            $scope.submitReviewStatus = "发布";
                            if(data.errcode==0){
                                $scope.reviewContent = "";
                                Student.courseinfo({"lessonid": $scope.lessoninfo.bookinfo.lesson_id}, function(data) {
                                    console.log(data);
                                    $scope.lessoninfo = data.data;
                                });

                                $rootScope.$broadcast('updatedLessonStatus');
                                $scope.$emit('finishSetHomework', $scope.lessoninfo.bookinfo.lesson_id);
                                $rootScope.$broadcast('showConfirmModal', {
                                    'title':'提示',
                                    'content':'发表成功!',
                                    clickPositive:function() {
                                        $('.sidebar-wrap').removeClass('active');//hide sidebar
                                    }
                                });
                            }
                            else{
                                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'发表失败:'+data.errmessage});
                            }
                        })
                    },
                });
            }
        }
        
        $scope.updateTrackStatus = function(track, status) {
            Teacher.updateTrackStatus({
                track_id: track.id,
                status: status
            }, function(response){
                if(response.errcode==0){
                    track.status = status;
                }
                if (status == 2) {
                    track.comments = [];
                    $scope.current_track_id = null;
                }
            })
        };

        $scope.openTrackComments = function (id) {
            if ($scope.current_track_id == id) {
                $scope.current_track_id = null;
            } else {
                $scope.current_track_id = id;
            }
        };

        $scope.submitTrackComment = function (book_idx, track_idx, lesson_id, track_id, content) {
            var params = {
                'lesson_id': lesson_id,
                'track_id': track_id,
                'content': content
            };
            console.log(params);
            Teacher.addTrackComment(params, function(data) {
                console.log(data);
                if(book_idx===null){
                    if($scope.lessoninfo){
                        $scope.lessoninfo.courseinfo.tracklist[track_idx].comments.push(data.data);
                    }else if($scope.bookinfo){
                        $scope.bookinfo.tracklist[track_idx].comments.push(data.data);
                    }
                }else{
                    $scope.lessoninfo.courseinfo.textbooklist[book_idx].tracklist[track_idx].comments.push(data.data);
                }
                content = '';
                $scope.new_comment_content = '';
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':error});
                // alert(error);
                console.log(error);
            });
        };

        $scope.deleteComment = function(index, track, comment) {
            console.log(comment);
            Teacher.delete_trackcomment({'comment_id': comment.id || comment.comment_id}, function(response){
                if (response.errcode == 0) {
                    track.comments.splice(track.comments.length-index-1, 1);
                }
            });
        };

        $scope.startModifyComment = function(comment) {
            $scope.currentModifyComment = comment;
            $scope.edit_comment_content = comment.content;
        };

        $scope.modifyComment = function(comment, content) {
            Teacher.modify_trackcomment({'content':content, 'comment_id': comment.comment_id}, function(response){
                if (response.errcode == 0) {
                    comment.content = angular.copy(content);
                    $scope.currentModifyComment = {};
                }
            });
        };

        $scope.toggleShowTrack = function(book, status) {
            if (status === true) {
                $.each($scope.lessoninfo.courseinfo.textbooklist, function(i, v) {
                    v.showTracks = false;
                });
            }
            book.showTracks = status;
        };
    }
]);

wegenartControllers.controller('SignupCtrl', ['$rootScope', '$scope', '$cookieStore', 'Account', '$location', 'authorizationService', 'fileUpload',
    function($rootScope, $scope, $cookieStore, Account, $location, authorizationService, fileUpload) {
        var openid = getParameterByName("openid");
        var shareopenid = getParameterByName("shareopenid");

        $scope.phone_error = false;
        $scope.phone_error_content = null;

        if (openid || shareopenid){
            $('.wechatposter').show();
//            car2.init();
        }

        $('.wechatposter').bind('touchend', function() {
            setTimeout(function() {
                $('.wechatposter').hide();
            }, 250);
        });

        //pagination
        $scope.nextStep = function() {
            if ($scope.signup(true))
                $('.xhead.active').removeClass('active').next().addClass('active');
            else
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请补全个人信息'});
        };
        $('.progress .step').click(function() {
            $('.xhead.active').removeClass('active');
            $($('.xhead')[$(this).attr('value')]).addClass('active');
        });
        uiutils.upload_avatar(fileUpload, $rootScope, $scope);

        $scope.languageList = languageList;

        $scope.distance = "100";

        var type = $('#type').val();
        $scope.sendCaptcha = function(){
            var phonenum = $('#phonenum').val();
            if (/\d{11}/.test(phonenum)) {
                $scope.phone_error = false;
                $scope.phone_error_content = null;
                $('#send_captcha').html('发送中..');
                $('#send_captcha').attr('disabled', true);
                Account.sendcaptcha({'phone': phonenum, 'type' : type}, function(response) {
                    if (response.errcode == 0) {
                        $('#send_captcha').attr('disabled', false);
                        $('#send_captcha').html('发送成功');
                        $('#captcha').focus();
                    }
                    else {
                        $scope.phone_error = true;
                        $scope.phone_error_content = response.errmessage;
                        $('#send_captcha').attr('disabled', false);
                        $('#send_captcha').html('发送失败');
                    }
                }, function(){
                    $('#send_captcha').attr('disabled', false);
                    $('#send_captcha').html('发送失败');
                });
            } else {
                $scope.phone_error = true;
                $scope.phone_error_content = '请输入合法的手机号';
            }
        }        

        $scope.signup = function(isTest) {
            var ages = '';
            $.each($('input[name="stu_age"]:checked'), function(i,v){if ($(v).val() >= 0) ages += $(v).val() + '$';});
            var levels = '';
            $.each($('input[name="stu_level"]:checked'), function(i,v){if ($(v).val() >= 0) levels += $(v).val() + '$';});
            var instruments = uiutils.get_setting_items('instrument-container');
            var goodats = uiutils.get_setting_items('goodat-container');
            var addrs = uiutils.get_setting_items('addr-container');
            var student_addr = $('select[name="addr-city"]').val() + $scope.addr_detail;
            var languageType = [];
            for (var i = 0; i < $scope.languageList.length; i++) {
              if($scope.languageList[i].checked){
                languageType.push($scope.languageList[i].id);
              }
            }

            //submit
            var params = {
                'openid': openid,
                'shareopenid': shareopenid,
                'invitecode' : $('#invitecode').val(),
                'phone' : $('#phonenum').val(),
                'captcha' : $('#captcha').val(),
                'email': $('#account').val(),
                'password': $('#passwd').val(),
                'type' : type,
                'avatar':$scope.avatar_id,
                'diploma':"",
                'name' :$('#name').val(),
                'nickname' : $('#nickname').val(),
                'gender' : $('input[name="repetition"]:checked').val() || 2,
                'birthday': $('select[name="birth-year"]').val() + '-' + $('select[name="birth-month"]').val() + '-' + $('select[name="birth-day"]').val(),
                'school' : $("#school").val(),
                'college' : $('#college').val(),
                'major' : $('#major').val(),
                'graduation_time': $('#graduation_time').val(),
                'instrument': instruments,
                'goodat' : goodats,
                'class_place': $('input[name="class_addr"]:checked').val(),
                'class_place_addr' : addrs || student_addr,
                'stu_level' : levels,
                'stu_age' : ages,
                'distance': $scope.distance,
                'language': languageType.join('$'),
                'parent' : $('#parentname').val()
            };
            if (isTest) {
                if (params.captcha && params.phone && params.invitecode && params.email
                    && params.password && params.avatar && params.name && params.gender && params.birthday
                    && $scope.account_error != true && $scope.passwd_error != true && $scope.passwd2_error != true) return true;
                return false;
            }

            if (type == "1") {
                if (!(params.captcha && params.phone && params.email && params.password && params.name)) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"请完整填写注册信息"});
                    return;
                }
                else if (!$('select[name="addr-city"]').val() || !$scope.addr_detail) {
                    params.class_place_addr = null;
                }
            }
            Account.register(params, function (response) {
                console.log(response);
                if (response.errcode == 0 || response.errcode == undefined) {
                    $cookieStore.put('token', response.data.token);
                    $cookieStore.put('uid', response.data.uid);
                    $cookieStore.put('type', response.data.type);
                    authorizationService.permissionModel.isPermissionLoaded = false;
                    // alert("register success");
                    if (type == 0) {
                        $location.path("/teacher/welcome/");
                    } else {
                        var returnurl = $cookieStore.get('streturnurl');
                        if (openid || shareopenid){
                            if (shareopenid) {
                                openid = shareopenid
                            }
                            // 使用angular的location，在weixin中无法分享
                            window.location.href = "http://www.wegenart.com/search/teacher/?openid="+openid;
                        } else if (returnurl) {
                            $cookieStore.remove('streturnurl');
                            $location.url(returnurl);
                        } else{
                            $location.path("/student/welcome/");
                        }
                    }
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"注册失败，原因：" + response.errmessage});
                    // alert("注册失败，原因：" + response.errmessage);
                }
            });
        };
        //'add' buttons
        $('#add_instrument').click(function() {
            uiutils.add_setting_item($('input[name="instrument"]'), $('#instrument-container .settings-list'));
        });
        $('#add_goodat').click(function() {
            uiutils.add_setting_item($('input[name="goodat"]'), $('#goodat-container .settings-list'));
        });

        $scope.addAddr = function() {
            var addr2 = $('input[name="class_place_addr"]').val();
            $('input[name="class_place_addr"]').val('');
            var addr1 = $('select[name="addr-city"]').val();
            if (addr1 == undefined || addr1 == null || addr2 == '') {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"请输入完整地址"});
                return;
            }
            uiutils.add_setting_item_value(addr1 + addr2, $('#addr-container .settings-list'));
        }

        //select all/none
        uiutils.setup_age_level_select();
        //calendar adaption
        uiutils.setup_day_selector();

        $scope.account_error = false;
        $scope.passwd_error = false;
        $scope.passwd2_error = false;
        //vaildation
        $('#account').blur(function() {
           Account.checkifregister({'username': $('#account').val()}, function(response) {
               $scope.account_error = !(response.errcode == 0);
           });
        });

        $('#passwd').blur(function() {
            $scope.passwd_error = (vaildpasswd($('#passwd').val()) === false);
        });

        $('#passwd2').blur(function() {
            if (vaildpasswd($('#passwd2').val()) === false || $('#passwd').val() != $('#passwd2').val()) {
                $scope.passwd2_error = true;
            } else {
                $scope.passwd2_error = false;
            }
        });

        $scope.showStudentAgreement = false;
        $scope.showTeacherAgreement = true;
        $scope.agree_agreement = function() {
            $scope.showStudentAgreement = false;
            $scope.showTeacherAgreement = false;
        };
        $scope.disagree_agreement = function() {
            $location.url('/');
        };
    }
]);

wegenartControllers.controller('TeacherWeekCtrl', ['$rootScope', '$scope','$location', '$routeParams', '$cookieStore', 'Teacher',
    function($rootScope, $scope, $location, $routeParams, $cookieStore, Teacher){
        var data = [[], [], [], [], [], [], []];
        $scope.data = data;

        $scope.dataFilter = null;
        $scope.changeFilter = function(f){
          $scope.dataFilter = f;
        };

        var wgcalendar = WGCalendar();
        var today = $routeParams.date ? new Date(parseInt($routeParams.date)) : new Date();
        $scope.date = wgcalendar.getMonday(today);

        $scope.weekDate = [];
        var weekdays = ['一', '二','三','四','五','六','日'];

        $scope.isToday = [];

        for (var i = 0; i < 7; i++) {
            var d = new Date($scope.date.getTime());
            d.setDate(d.getDate() + i);
            $scope.weekDate.push({
                date: d,
                day: weekdays[i]
            });

            if (d.isSameDateAs(new Date()))
                $scope.isToday.push(true);
            else
                $scope.isToday.push(false);
        }

        console.log($scope.isToday);

        var fetchData = function () {
            if ($scope.dismiss) $scope.dismiss();
            $scope.data = [[], [], [], [], [], [], []];
            var startDate = wgcalendar.getMonday($scope.date);
            var start = wgcalendar.dateFormat(startDate, "yyyymmdd");
            var end = new Date(startDate.getTime());
            end.setDate(end.getDate() + 6);
            end = wgcalendar.dateFormat(end, "yyyymmdd");

            Teacher.calendar({'start':start, 'end':end}, function(response){
				
				console.log(response);
                var class_place = response.data.class_place;
                var class_place_addrlist = response.data.class_place_addrlist;
                $scope.class_place = class_place;
                $scope.class_place_addrlist = class_place_addrlist;
                $scope.class_place_addrlist_bak = class_place_addrlist;

                $scope.data = wgcalendar.renderWeekItems($scope.date, response.data.calendar, $scope.data);
            });
        };

        $scope.dismiss = function () {
            $scope.$broadcast('dismissReservationPopup');
        };

        $scope.today = function () {
            $location.path('/teacher/week/');
        };

        $scope.previousWeek = function () {
            var prevDate = new Date($scope.date.getTime());
            prevDate.setDate(prevDate.getDate() - 7);
            $location.path('/teacher/week/date/' + prevDate.getTime());
        };

        $scope.nextWeek = function () {
            var nextDate = new Date($scope.date.getTime());
            nextDate.setDate(nextDate.getDate() + 7);
            $location.path('/teacher/week/date/' + nextDate.getTime());
        };

        $scope.findItemById = function(id) {
            var ret = undefined;
            if ($scope.data) {
                $.each($scope.data, function (i, day) {
                    $.each(day, function (j, item) {
                        if (item && item.id == id) {
                            ret = item;
                            return;
                        }
                    });
                    if (ret != undefined) return;
                });
            }
            return ret;
        }

        $scope.findDayOfWeekById = function(id) {
            var ret = undefined;
            if ($scope.data) {
                $.each($scope.data, function (i, day) {
                    $.each(day, function (j, item) {
                        if (item && item.id == id) {
                            ret = i;
                            return;
                        }
                    });
                    if (ret != undefined) return;
                });
            }
            return ret;
        }

        $scope.viewSidebar = function (id) {
            $scope.$broadcast('viewSidebar', id, 'lesson');
        };

        $scope.viewFreeTimeItem = function(e, id) {
            console.log("view free time item,id=" + id);
            var item = $scope.findItemById(id);
            if (item) {
                console.log('clicked event');
                console.log(e);
                var free = [];
                free.push(item);
                var box_h = 40;

                console.log('getDate' + item.start_date.getDate());
                var left = $('.day-item').width() * ($scope.findDayOfWeekById(item.id) + 1);
                var top = Math.floor((e.pageY - $('.week-days-container').offset().top) / box_h);
                var params = {
                    free : free,
                    busy : true,
                    date : item.start_date,
                    class_place_addr : item.class_place_addr,
                    class_place : item.class_place,
                    class_place_addrlist:$scope.class_place_addrlist_bak,
                    showsAddEvent: false,
                    showsCurrentReservation: true,
                    position: {left: left, top: (top - 0.5) * box_h}
                }
                $scope.$broadcast('showReservationPopup', params);
            }
        }

        $scope.$on('prepareReservationPopup', function (event, params) {
            var newParams = {
                date: params.date,
                newEvent: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                    class_place_addr: ($scope.class_place_addrlist_bak && $scope.class_place_addrlist_bak.length > 0) ? $scope.class_place_addrlist_bak[0] : null,
                    class_place_addrlist: $scope.class_place_addrlist_bak,
                    shouldRepeatEvent: true
                },
                position: params.position,
                showsAddEvent: true,
                showsCurrentReservation: false
            };
            console.log($scope.class_place_addrlist_bak[0]);
            console.log('prepare');
            console.log(newParams);
            $scope.$broadcast('showReservationPopup', newParams);
        });

        $scope.$on('didSubmitReservation', function (event, params) {
            Teacher.addEvent(params, function(data) {
                console.log(data);
                if (data.errcode == 0) {
                    $scope.dismiss();
                    fetchData();
                } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': data.errmessage});

            }, function(error) {
                $scope.dismiss();
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                console.log(error);
            });
        });

        $scope.$on('didDeleteFreeTime', function(event, params) {
            $scope.dismiss();
            $scope.chooseDeleteFreeTimeOptionParams = params;
            $scope.chooseDeleteFreeTimeOption = true;
        });

        $scope.$on('acceptCourseRequest', function(event) {
            fetchData();
        });

        $scope.didChooseDeleteFreeTimeOption = function(num) {
            $.extend($scope.chooseDeleteFreeTimeOptionParams, {type:num});
            Teacher.deleteFreeTime($scope.chooseDeleteFreeTimeOptionParams, function(response) {
                if (response.errcode == 0) {
                    $scope.chooseDeleteFreeTimeOption = false;
                    fetchData();
                }
                else if (response.errcode == 2) {
                    $scope.chooseDeleteFreeTimeOption = false;
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content': "您即将删除的排期已有学生预约，如需删除，请致电该排期中已预约课程的学生说明情况，由学生执行取消再预约的操作！"});
                } else {
                    $scope.chooseDeleteFreeTimeOption = false;
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': response.errmessage});
                }
            });
        };

        $scope.$on('didChangeFreeTime', function(event, params) {
            Teacher.modifyFreeTime(params, function(response) {
                if (response.errcode == 0) {
                    fetchData();
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content': "修改成功！"});
                } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': data.errmessage});
            });
        });

        $scope.dismissChooseFreeTimeOption = function() {
            $scope.chooseDeleteFreeTimeOption = false;
        };

        $scope.chooseDeleteFreeTimeOption = false;
        fetchData();
        
        $rootScope.$on('updatedLessonStatus', function(evnet, params){
            fetchData(); 
        });

    }
]);

wegenartControllers.controller('TeacherMonthCtrl', ['$rootScope', '$scope', '$location', '$routeParams', 'Teacher', 'Student',
    function($rootScope, $scope, $location, $routeParams, Teacher, Student){
        console.log('teacher.calendar');
        var wgcalendar = WGCalendar();
        var today = $routeParams.date ? new Date(parseInt($routeParams.date)) : new Date();
        $scope.date = wgcalendar.firstMonthDay(today);
        $scope.data = wgcalendar.renderCalendar($scope.date);
        $scope.dataFilter = null;

        $scope.showsCurrentReservation = false;

        var fetchData = function () {
            $scope.dismiss();
            $scope.date = wgcalendar.firstMonthDay($scope.date);
            $scope.data = wgcalendar.renderCalendar($scope.date);

            var tS = wgcalendar.getMonday($scope.date);
            var start = wgcalendar.dateFormat(tS, "yyyymmdd");
            var tE = wgcalendar.getSunday(wgcalendar.lastMonthDay($scope.date));
            var end = wgcalendar.dateFormat(tE, "yyyymmdd");
            Teacher.calendar({'start':start, 'end':end}, function(response){
                console.log(response);

                var class_place = response.data['class_place'];
                var class_place_addrlist = response.data['class_place_addrlist'];
                $scope.class_place = class_place;
                $scope.class_place_addrlist = class_place_addrlist;

                $scope.data = wgcalendar.renderCalendarItems($scope.date, response.data.calendar, $scope.data);

            });
        };
        
        $scope.changeFilter = function(f){
          $scope.dataFilter = f;
        };

        $scope.today = function () {
            $scope.date = wgcalendar.firstMonthDay(new Date());
            $location.path('/teacher/month/');
        };

        $scope.previousMonth = function () {
            $scope.date.setMonth($scope.date.getMonth() - 1);
            $location.path('/teacher/month/date/' + $scope.date.getTime());
        };

        $scope.nextMonth = function () {
            $scope.date.setMonth($scope.date.getMonth() + 1);
            $location.path('/teacher/month/date/' + $scope.date.getTime());
        };

        $scope.showPopup = function (cell, coordinate) {
            var x = coordinate.x;
            var y = coordinate.y; 
            var cell_width = $('td').width();
            var cell_height = 161;

            var top = x * cell_height + 15;
            var left = (y + 1) * cell_width;

            var params = {
                busy: cell.busy,
                free: cell.free,
                date: cell.date,
                class_place:$scope.class_place,
                class_place_addrlist: $scope.class_place_addrlist,
                position: {left: left, top: top},
                showsAddEvent: false,
                showsCurrentReservation: false
            };
            console.log("teacher month, params=");
            console.log(params);
            $scope.$broadcast('toggleReservationPopup', params);
        };

        $scope.dismiss = function () {
            $scope.$broadcast('dismissReservationPopup');
        };

        fetchData();

        $scope.viewSidebar = function (id) {
            $scope.dismiss();
            $scope.$broadcast('viewSidebar', id, 'lesson');
        };

        $scope.$on('didSubmitReservation', function (event, params) {
            Teacher.addEvent(params, function(data) {
                console.log(data);
                if (data.errcode == 0) {
                    $scope.dismiss();
                    fetchData();
                } else $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': data.errmessage});
            }, function(error) {
                $scope.dismiss();
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content': error});
                console.log(error);
            });
        });

        $rootScope.$on('updatedLessonStatus', function(evnet, params){
            fetchData(); 
        });
    }
]);

wegenartControllers.controller('ReservationPopupCtrl', ['$rootScope', '$scope', '$filter', 'Teacher',
    function ($rootScope, $scope, $filter, Teacher) {
        $scope.Math = window.Math;

        $scope.timePickerOptions = {
            step: 30,
            timeFormat: 'g:ia',
            lang: {
                am: ' AM',
                pm: ' PM'
            },
            minTime: '0700',
            maxTime: '2400'
        };

        $scope.$on('showReservationPopup', function (event, data) {
            $scope.showReservationPopup(event, data);
        });

        $scope.$on('dismissReservationPopup', function (event) {
            $scope.dismiss();
        });

        $scope.$on('toggleReservationPopup', function (event, data) {
            if ($scope.showsPopup) {
                $scope.dismiss();
            } else {
                $scope.showReservationPopup(event, data);
            }
        });

        $scope.$on('didChangePopupTop', function (event, data) {
            $scope.position.top = data.top;
        });

        $scope.setselecteddate = function(date) {
            var value = date.getFullYear() + '';
            var month = date.getMonth() + 1;
            if (month < 10) month = '0' + month;
            var day = date.getDate();
            if (day < 10) day = '0' + day;
            value += month + '' + day;
            $scope.dateselected = value;
        };

        $scope.showReservationPopup = function (event, data) {
            console.log('show popup', data);
            $scope.showsPopup = true;
            $scope.busy = data.busy;
            $scope.free = data.free;
            $scope.date = data.date;
            $scope.student_class_home = data.student_class_home;
            $scope.showsAddEvent = data.showsAddEvent;
            $scope.showsCurrentReservation = data.showsCurrentReservation;
            $scope.position = data.position;
            $scope.showsRepeat = data.showsRepeat;
            $scope.class_place_addr = data.class_place_addr;
            $scope.class_place_addrlist = data.class_place_addrlist;
            $scope.createNewEvent(data.newEvent);
            $scope.currentFreeItem = data.free && data.free.length > 0 ? data.free[0] : undefined;
            $scope.setupAddrList($scope.currentFreeItem);
//            if ($scope.showsCurrentReservation) $scope.class_place = $scope.currentFreeItem ? $scope.currentFreeItem.class_place : 2;
            $scope.showChangeReservation = false;

            if ($scope.firstshowreservationpopup === undefined) {
                $scope.firstshowreservationpopup = false;
                $scope.setselecteddate(new Date());
                $('.date-input').each(function(index, el){
                    var picker = new Pikaday({
                      showMonthAfterYear: true,
                      minDate: (new Date()),
                      defaultDate : (new Date()),
                        setDefaultDate:true,
                      field: $(this)[0],
                        onSelect: function(date) {
                            $scope.setselecteddate(date);
                        }
                    });
                });
            }
        };


        $scope.dismiss = function () {
            console.log('dismiss popup');
            $scope.showsPopup = false;
            $scope.cell = null;
            $scope.$emit('didDismissPopup');
        };

        $scope.showAddEvent = function () {
            $scope.showsAddEvent = true;
        };

        $scope.createNewEvent = function (newEvent) {
            if (newEvent) {
                if (!$scope.newEvent) $scope.newEvent = {};
                angular.copy(newEvent, $scope.newEvent);
                if (newEvent.class_place_addrlist && $scope.class_place_addrlist == undefined) $scope.class_place_addrlist = newEvent.class_place_addrlist;
                if (!$scope.newEvent.class_place_addr) {
                    $scope.newEvent.class_place_addr = ($scope.class_place_addrlist && $scope.class_place_addrlist.length > 0) ? $scope.class_place_addrlist[0] : null;
                }
            } else {
                var start = new Date(0);
                start.setTime(start.getTimezoneOffset() * 60000);
                start.setHours(start.getHours() + $scope.free && $scope.free[0] ? $scope.free[0].start_date.getHours() : 7);
                start.setMinutes($scope.free && $scope.free[0] ? $scope.free[0].start_date.getMinutes() : 0);

                var end = new Date(start.getTime());
                end.setHours(end.getHours() + 1);

                $scope.newEvent = {
                    startDate: start,
                    endDate: end,
                    class_place_addr: ($scope.class_place_addrlist && $scope.class_place_addrlist.length > 0) ? $scope.class_place_addrlist[0] : null,
                    shouldRepeatEvent: true
                };
                console.log('newevent');
                console.log($scope.newEvent);
            }

            $scope.newEvent.duration = $scope.newEvent.endDate - $scope.newEvent.startDate;
        };

        $scope.setupAddrList = function(value) {
            if ($scope.showsCurrentReservation) return;
            console.log("currentfreeitem changed");
            if (value == undefined) return;
            var ret = [];
            if (value.class_place != enum_class_places.teacherHome) {
                if ($scope.student_class_home) ret.push($scope.student_class_home);
            }
            if (value.class_place != enum_class_places.studentHome) {
                if (value.class_place_addr) ret.push(value.class_place_addr);
            }
            $scope.newEvent.class_place_addr = (ret && ret.length > 0) ? ret[0] : null;
            $scope.class_place_addrlist = ret;
        };

        $scope.$watch('newEvent.startDate', function (value) {
            if (value == undefined) return;
            var endDate = new Date(value.getTime() + $scope.newEvent.duration);
            $scope.newEvent.endDate = endDate;

            if ($scope.free) {
                $.each($scope.free, function(i, v) {
                    if ($scope.newEvent.startDate.between(v.start_date, v.end_date)) $scope.currentFreeItem = v;
                });
            }
        }, true);

        $scope.$watch('newEvent.endDate', function (value) {
            if ($scope.newEvent == undefined) return;
            var startDate = new Date($scope.newEvent.startDate);
            var endDate = new Date(value);
            $scope.newEvent.duration = endDate - startDate;

            $scope.$emit('didChangeNewReservationDate', {startDate:startDate, endDate:endDate});

        }, true);

        $scope.$watch('currentFreeItem', function (value) {
            $scope.setupAddrList(value);
        }, true);

        $scope.submitEvent = function () {
            console.log('submit event, newEvent=');
            console.log($scope.newEvent);
            var currentStartDate = new Date($scope.date.getTime());
            var currentEndDate = new Date($scope.date.getTime());
            currentStartDate.setHours($scope.newEvent.startDate.getHours());
            currentStartDate.setMinutes($scope.newEvent.startDate.getMinutes());
            currentEndDate.setHours($scope.newEvent.endDate.getHours());
            currentEndDate.setMinutes($scope.newEvent.endDate.getMinutes());

            // to string
            if (currentEndDate.getTime() < currentStartDate.getTime()) {
                currentEndDate = $filter('date')(currentEndDate, 'yyyyMMdd') + "2359";
            } else {
                currentEndDate = $filter('date')(currentEndDate, 'yyyyMMddHHmm');
            }
            currentStartDate = $filter('date')(currentStartDate, 'yyyyMMddHHmm');
            console.log(currentStartDate);
            console.log(currentEndDate);


            var params = {
                'start': currentStartDate,
                'end': currentEndDate,
                'class_place_addr': $scope.newEvent.class_place_addr
            };
            if ($scope.newEvent.shouldRepeatEvent) {
                $.extend(params, {'frequency' : $('select[name="repeat-freq"]').val()});
                var week_type = $('input[name="repetition"]:checked').val();
                if (week_type == 'forever') {
                    $.extend(params, {'week_num' : "forever"});
                } else if (week_type == 'weeks') {
                    $.extend(params, {'week_num' : $('select[name="repeat-weeks"]').val()});
                } else {
                    $.extend(params, {'end_date' : $scope.dateselected});
                }
            }

            $scope.$emit('didSubmitReservation', params);
        };

        $scope.deleteFreeTimeEvent = function() {
            var item = $scope.free[0];
            if (item) {
                var currentStartDate = $filter('date')(item.start_date, 'yyyyMMddHHmm');
                var currentEndDate = $filter('date')(item.end_date, 'yyyyMMddHHmm');
                var params = {
                    'start' : currentStartDate,
                    'end' : currentEndDate
                };
                $scope.$emit('didDeleteFreeTime', params);
            }
        };

        $scope.changeEvent = function() {
            if ($scope.showChangeReservation) {
                var item = $scope.free[0];
                if (item) {
                    var currentStartDate = $filter('date')(item.start_date, 'yyyyMMddHHmm');
                    var currentEndDate = $filter('date')(item.end_date, 'yyyyMMddHHmm');
                    var mStartDate = $filter('date')($scope.newEvent.startDate, 'yyyyMMddHHmm');
                    mStartDate = currentStartDate.substring(0, 8) + mStartDate.substring(8, 12);
                    var mEndDate = $filter('date')($scope.newEvent.endDate, 'yyyyMMddHHmm');
                    mEndDate = currentEndDate.substring(0, 8) + mEndDate.substring(8, 12);
                    var params = {
                        'start' : currentStartDate,
                        'end' : currentEndDate,
                        'mstart': mStartDate,
                        'mend' : mEndDate,
                        'teachpoint' : $scope.newEvent.class_place_addr
                    };
                    $scope.$emit('didChangeFreeTime', params);
                    $scope.showChangeReservation = false;
                }
            } else {
                $scope.showChangeReservation = true;
            }
        };
    }
]);

wegenartControllers.controller('TeacherMyStudentsCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
        Teacher.students({}, function(response){
            $scope.students = response.data.mystudents;
        });
    }
]);

wegenartControllers.controller('TeacherStudentTimelineCtrl', ['$rootScope', '$scope', '$routeParams', 'Student',
    function($rootScope, $scope, $routeParams, Student){
        var access = {
            "student_id": $routeParams.sid
        }
        Student.timeline(access, function(data) {
            console.log(data);
            
            $scope.alltimeline = data.data.timelineinfo;
            $scope.basicinfo = data.data.baseinfo;
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate(data.data.timelineinfo));

            $scope.today = new Date();
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':error});
            //alert(error);
            console.log(error);
        });
        $scope.sid = $routeParams.sid;
        $scope.currentTab = 0;
        $scope.timelineTab = 0;

        // sidebar
        $scope.viewSidebar = function(type, id) {
          $scope.$broadcast('viewSidebar', id, type, $scope.sid);
        };
        
        // Timeline tab
        $scope.allTimeline = function() {
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate($scope.alltimeline));
            $scope.timelineTab = 0;
        }

        $scope.onlyComments = function() {
            var filtered = $scope.alltimeline.filter(function(el) {
                return (el.type == 1) && (el.state == 0);
            });
            $scope.timeline = utils.toDictionaryArray(utils.groupTimelineByDate(filtered));
            $scope.timelineTab = 1;
        }
    }
]);

wegenartControllers.controller('TeacherStudentTextbookCtrl', ['$rootScope', '$scope', '$routeParams', 'Student',
    function($rootScope, $scope, $routeParams, Student){
        var params = {
            "student_id": $routeParams.sid
        };
        $scope.fetchData = function() {
            Student.textbook(params, function(data) {
                console.log(data);
                $scope.basicinfo = data.data.baseinfo;
                $scope.textbooks = data.data.textbooks;
                $scope.has_course = data.data.has_course;
            }, function(error) {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':error});
                console.log(error);
            });
        };

        $scope.fetchData();
        
        $scope.currentTab = 1;

        $scope.$on('fetchTextbooks', function (event) {
            $scope.fetchData();
        });

        $scope.viewSidebar = function(type, id, isAddTextbook) {
            $scope.$broadcast('viewSidebar', id, type, $routeParams.sid, false, false, isAddTextbook);
        };

        $scope.addTextBook = function() {
            $scope.$broadcast('viewSidebar', null, 'lesson', $routeParams.sid, false, false, true);
        };
    }
]);

wegenartControllers.controller('TeacherStudentTracksCtrl', ['$rootScope', '$scope', '$routeParams', 'Student',
    function($rootScope, $scope, $routeParams, Student){
        var params = {
            "student_id": $routeParams.sid
        };
        Student.track(params, function(data) {
            console.log(data);
            $scope.basicinfo = data.data.baseinfo;
            $scope.tracklist = data.data.tracklist;
            $scope.count = data.data.count;
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':error});
            //alert(error);
            console.log(error);
        });
        $scope.currentTab = 2;
    }
]);

wegenartControllers.controller('TeacherStudentProfileCtrl', ['$rootScope', '$scope', '$routeParams', 'Student', 'Teacher', '$location',
    function($rootScope, $scope, $routeParams, Student, Teacher, $location){
        var params = {
            "student_id": $routeParams.sid
        };
        Student.profile(params, function(data) {
            console.log(data);
            $scope.basicinfo = data.data.baseinfo;
            $scope.profile = data.data.profileinfo[0];
        }, function(error) {
            $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':error});
            //alert(error);
            console.log(error);
        });
        $scope.currentTab = 3;
        $scope.showCancelRelationshipFeedbackModal = false;
        $scope.reasons = cancel_relationship_reasons[roles.teacher];
        $scope.reasonSelect = $scope.reasons[0];
        $scope.reasonDetail = '';

        $scope.changehappened = function(data){
            $rootScope.$emit('reasonselected', data);
        };
        $rootScope.$on('reasonselected', function(evt, data){
            $scope.reasonSelect = data;
        });

        $scope.removeRelationship = function() {
            if ($scope.reasonSelect.value == $scope.reasons[$scope.reasons.length - 1].value) { //other reason
                if (!$scope.reasonDetail || $scope.reasonDetail == '') {
                    $scope.showCancelRelationshipFeedbackModal = false;
                    $rootScope.$broadcast('showConfirmModal', {'title': '提示', 'content': '请输入具体原因',
                    'clickPositive':function(){
                        $scope.showCancelRelationshipFeedbackModal = true;
                    }});
                    return;
                }
            }
            console.log('reason detail' + $scope.reasonDetail);
            console.log('reason select' + $scope.reasonSelect.name);
            $.extend(params, {'reason':$scope.reasonSelect.value});
            $.extend(params, {'description':$scope.reasonDetail});
            Teacher.removeStudent(params, function(response){
                 if (response.errcode == 0) {
                    $location.url('/teacher/mystudents/');
                 } else $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':response.errmessage});
                 // alert(response.errmessage);
            });
        };
    }
]);

wegenartControllers.controller('TeacherSettingInfoCtrl', ['$rootScope', '$scope', 'Teacher', 'fileUpload',
    function($rootScope, $scope, Teacher, fileUpload){
        $scope.currentTab = 0;
        //calendar adaption
        uiutils.setup_day_selector();

        uiutils.upload_avatar(fileUpload, $rootScope, $scope);
        $scope.confirm_changes = function() {
            var data = {
                'name' : $('#name').val(),
                'nickname' : $('#nickname').val(),
                'gender' : $('input[name="repetition"]:checked').val() || 2,
                'birthday': $('select[name="birth-year"]').val() + '-' + $('select[name="birth-month"]').val() + '-' + $('select[name="birth-day"]').val()
            };
            if ($scope.avatar_id) {
                $.extend(data, {'avatar' : $scope.avatar_id});
            }
            Teacher.set_setting_profile(data, function(response) {
                console.log(response);
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功！'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
                // if (response.errcode == 0) alert('修改成功');
                // else alert(response.errmessage);
            });
        };
        Teacher.get_setting_profile({}, function(response){
            console.log(response);
            $scope.profileinfo = response.data.profile;
            $.each($('input[name="repetition"]'), function(i, v) {
               if ($(v).attr('value') == $scope.profileinfo.gender) $(v).attr('checked', true);
            });
        });
    }
]);

wegenartControllers.controller('TeacherSettingExperienceCtrl', ['$rootScope', '$scope', 'Teacher', 'Account', 'fileUpload',
    function($rootScope, $scope, Teacher, Account, fileUpload){
        $scope.currentTab = 1;

        $scope.year_list = [];
        for (var i = 2020; i >= 1970; i--) {
            $scope.year_list.push(i);
        }

        $scope.month_list = [];
        for (var i = 12; i >= 1; i--) {
            $scope.month_list.push(i);
        }

        Teacher.get_setting_record({}, function(response) {
            console.log(response);
            $scope.data = response.data;

            $scope.insInfoList = [];
            if ($scope.data.instruments)
                $scope.insInfoList.push($scope.data.instruments);
            $scope.goodats = [];
            $.each($scope.data.goodats, function(i, v) {
                $scope.goodats.push(v.name);
            });
            console.log($scope.goodats);

            $scope.studentAwards = $scope.data.stu_awards;
            $scope.teacherAwards = $scope.data.tea_awards;
            $scope.positions = $scope.data.positions;
            $scope.pastPositions = $scope.data.previous_positions;
            $scope.graduations = $scope.data.graduations;
        });

        var wgcalendar = WGCalendar();

        $scope.submit_change = function() {
            var tins = [];
            $.each($scope.insInfoList, function(i, v){
                tins.push(v.instrument+'/'+ v.schoolage);
            });
            var instruments = tins.join('$');
            // console.log('instruments:' + instruments);

            var ttea_award = [];
            $.each($scope.teacherAwards, function(i, v){
                ttea_award.push(v.award_name + '/' + v.award_result + '/' + v.award_year+ '/' + v.pic_id);
            });
            var tstu_award = [];
            $.each($scope.studentAwards, function(i, v){
                tstu_award.push(v.student + '/' + v.award_name + '/' + v.award_result + '/' + v.award_year + '/' + v.pic_id);
            })
            var tposition = [];
            $.each($scope.positions, function(i, v){
                tposition.push(v.name+'/' + v.start + '/' + v.end + '/' + v.pic_id + '/' + v.unitname);
            });

            var tgraduation = [];
            $.each($scope.graduations, function(i, v){
                var timestr = wgcalendar.dateFormat(v.graduation_time, "yyyy-mm-dd");
                tgraduation.push(v.school + '/' + v.college+'/'+ v.major+'/'+ timestr +'/'+ v.educational_background+'/'+ v.master+'/'+ v.pic_id);
            });
            var data = {
                'instrument': instruments,
                'goodat': $scope.goodats.join('$'),
                'tea_award':ttea_award.join('$'),
                'stu_award':tstu_award.join('$'),
                'position':tposition.join('$'),
                'graduation':tgraduation.join('$'),
                'teaching_concept':$("#teaching_concept").val()
            };

            Teacher.set_setting_record(data, function(response){
                console.log(response);
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功！'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
            });
        };

        $scope.delete = function(index, arrayd) {
            arrayd.splice(index, 1);
        };

        //$scope.graduations
        $scope.graduations = [];
        $scope.graduation = {};
        $scope.addGraduation = function() {
            $scope.graduation.graduation_time = $('select[name="graduation-year"]').val();
            if ($scope.graduation.college && $scope.graduation.major && $scope.graduation.master &&$scope.graduation.pic_id
                && $scope.graduation.educational_background && $scope.graduation.graduation_time && $scope.graduation.school) {
                $scope.graduations.push(angular.copy($scope.graduation));
                $scope.graduation = {};
                $("#button-graduation-cert").html("上传毕业证书");
                $('select[name="graduation-year"]').val($("select[name='graduation-year'] option:first").val());
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };

        uiutils.upload_image(fileUpload, $rootScope, $scope, $("#input-graduation-cert"), $('#button-graduation-cert'), function(id, url){
            $scope.graduation.pic_id = id;
        });

        //instrument
        $scope.defaultIns = {'instrument':'', schoolage:''};
        $scope.tempIns = angular.copy($scope.defaultIns);
        $scope.insInfoList = [];
        Teacher.get_instrument_list({}, function(response){
             if (response.errcode == 0) {
                 $scope.instrumentList = response.data;
             }
        });

        $scope.addIns = function() {
            if ($scope.tempIns.instrument != '' && $scope.tempIns.schoolage != '' && $scope.insInfoList.length < 1) {
                $scope.insInfoList.push(angular.copy($scope.tempIns));
                $scope.tempIns = angular.copy($scope.defaultIns);
            }
            else if($scope.insInfoList.length >= 1) {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'乐器只能选择一项'});
            } 
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };

        //works
        Account.get_all_works({}, function(response){
            if (response.errcode == 0) {
                $scope.allworks = response.data;
            }
        });

        //teacher awards
        $scope.teacherAwards = [];
        $scope.teacherAward = {};
        uiutils.upload_image(fileUpload, $rootScope, $scope, $("#input-teacher-cert"), $('#button-teacher-cert'), function(id, url){
            $scope.teacherAward.pic_id = id;
        });
        $scope.addTeacherAward = function() {
            $scope.teacherAward.award_year = $('select[name="teacherAward-year"]').val() + '-' + $('select[name="teacherAward-month"]').val();
            if ($scope.teacherAward.award_name && $scope.teacherAward.pic_id && $scope.teacherAward.award_result && $('select[name="teacherAward-year"]').val() && $('select[name="teacherAward-month"]').val()) {
                $scope.teacherAwards.push(angular.copy($scope.teacherAward));
                $scope.teacherAward = {};
                $("#button-teacher-cert").html("上传获奖证书");
                $('select[name="teacherAward-year"]').val($("select[name='teacherAward-year'] option:first").val());
                $('select[name="teacherAward-month"]').val($("select[name='teacherAward-month'] option:first").val());
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };
        //student awards
        $scope.studentAwards = [];
        $scope.studentAward = {};
        uiutils.upload_image(fileUpload, $rootScope, $scope, $("#input-student-cert"), $('#button-student-cert'), function(id, url){
            $scope.studentAward.pic_id = id;
        });
        $scope.addStudentAward = function() {
            $scope.studentAward.award_year = $('select[name="studentAward-year"]').val() + '-' + $('select[name="studentAward-month"]').val();
            if ($scope.studentAward.award_name && $scope.studentAward.pic_id && $scope.studentAward.student && $scope.studentAward.award_result && $('select[name="studentAward-year"]').val() && $('select[name="studentAward-month"]').val()) {
                $scope.studentAwards.push(angular.copy($scope.studentAward));
                $scope.studentAward = {};
                $("#button-student-cert").html("上传获奖证书");
                $('select[name="studentAward-year"]').val($("select[name='studentAward-year'] option:first").val());
                $('select[name="studentAward-month"]').val($("select[name='studentAward-month'] option:first").val());
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };
        //current position
        $scope.positions = [];
        $scope.position = {};
        uiutils.upload_image(fileUpload, $rootScope, $scope, $("#input-position-cert"), $('#button-position-cert'), function(id, url){
            $scope.position.pic_id = id;
        });
        $scope.addPosition = function() {
            console.log($scope.position.tilltoday);
                
            $scope.position.start = $('select[name="position-startyear"]').val() + '-' + $('select[name="position-startmonth"]').val();
            if (!$scope.position.tilltoday) {
                console.log($('select[name="position-startmonth"]').val());
                console.log($('select[name="position-endmonth"]').val());
                if ((parseInt($('select[name="position-startmonth"]').val()) > parseInt($('select[name="position-endmonth"]').val()) && parseInt($('select[name="position-startyear"]').val()) == parseInt($('select[name="position-endyear"]').val())) || parseInt($('select[name="position-startyear"]').val()) > parseInt($('select[name="position-endyear"]').val())) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'开始时间不能大于结束时间！'});
                    return;
                } 
                $scope.position.end = $('select[name="position-endyear"]').val() + '-' + $('select[name="position-endmonth"]').val();
            }
            console.log($scope.position.start);
            console.log($scope.position.end);
            if ($scope.position.name && $scope.position.unitname && $scope.position.pic_id && $scope.position.start && $scope.position.end) {
                $scope.positions.push(angular.copy($scope.position));
                $scope.position = {};
                $("#button-position-cert").html("上传聘书");
                $('select[name="position-startyear"]').val($("select[name='position-startyear'] option:first").val());
                $('select[name="position-startmonth"]').val($("select[name='position-startmonth'] option:first").val());
                $('select[name="position-endyear"]').val($("select[name='position-endyear'] option:first").val());
                $('select[name="position-endmonth"]').val($("select[name='position-endmonth'] option:first").val());
            }
            else {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请将信息填写完整'});
            }
        };

        $scope.$watch('position.tilltoday', function(value) {
            console.log('tilltoday=' + value);
            if (value === true) {
                $scope.position.end = "至今";
            } else {
                $scope.position.end = undefined;
            }
        });

    }
]);

wegenartControllers.controller('TeacherSettingPreferenceCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
        $scope.currentTab = 2;
        $scope.languageList = languageList;
        $scope.confirm_changes = function() {
            var ages = '';
            $.each($('input[name="stu_age"]:checked'), function(i,v){if ($(v).val() >= 0) ages += $(v).val() + '$';});
            var levels = '';
            $.each($('input[name="stu_level"]:checked'), function(i,v){if ($(v).val() >= 0) levels += $(v).val() + '$';});
            var addrs = uiutils.get_setting_items('addr-container');
            var languageType = [];
            for (var i = 0; i < $scope.languageList.length; i++) {
              if($scope.languageList[i].checked){
                languageType.push($scope.languageList[i].id);
              }
            }
            var data = {
                'class_place': $('input[name="class_addr"]:checked').val(),
                'addr' : addrs,
                'level' : levels,
                'age' : ages,
                'language' : languageType.join('$')
            };
            Teacher.set_setting_preferfence(data, function(response) {
                console.log(response);
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功！'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
                // if (response.errcode == 0) alert('修改成功');
                // else alert(response.errmessage);
            });
        };
        //select all/none
        uiutils.setup_age_level_select();
        
        $scope.addAddr = function() {
            if (!$('select[name="addr-city"]').val() || !$('input[name="class_place_addr"]').val()) {
                $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'请完整填写授课地址'});
                return;
            }
            var value = $('select[name="addr-city"]').val() + $('input[name="class_place_addr"]').val();
            $('input[name="class_place_addr"]').val('');
            uiutils.add_setting_item_value(value, $('#addr-container .settings-list'));
        };
        Teacher.get_setting_preferfence({}, function(response){
            console.log(response);
            $scope.preferfence = response.data.preferfence;
            $.each($('input[name="class_addr"]'), function(i, v) {
               if ($(v).attr('value') == $scope.preferfence.class_place) $(v).attr('checked', true);
            });
            $.each($scope.preferfence.age, function(ii, vv){
                $.each($('input[name="stu_age"]'), function(i, v) {
                    if ($(v).attr('value') == vv) $(v).attr('checked', true);
                });
            });
            $.each($scope.preferfence.level, function(ii, vv) {
                $.each($('input[name="stu_level"]'), function (i, v) {
                    if ($(v).attr('value') == vv) $(v).attr('checked', true);
                });
            });
            $.each($scope.preferfence.addr, function(i, v) {
                uiutils.add_setting_item_value(v, $('#addr-container .settings-list'));
            });
            $.each($scope.preferfence.teaching_language, function(i, v) {
                 $scope.languageList[v].checked = true;
            });
        });
    }
]);

wegenartControllers.controller('TeacherSettingPayCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
        $scope.currentTab = 3;

        $scope.submitWithdraw = function(response) {
            if ($scope.withdraw.withdraw_cash)
                Teacher.requestWithdraw($scope.withdraw, function(response){
                    console.log(response);
                    $scope.showWithDrawModal = false;
                    if (response.errcode == 1)
                        $rootScope.$broadcast('showConfirmModal', {title:'提示', content: response.errmessage });
                    else {
                        $rootScope.$broadcast('showConfirmModal', {title:'提现请求', content:'您已成功申请提现，请耐心等待24小时'});
                        $scope.fetchData();
                    }
                });
        };

        $scope.showWithDrawModal = false;
        $scope.showInvalidWithdrawAmount = false;

        $scope.withdraw = {};
        $scope.withdraw.paymethod = 0;
        $scope.withdraw.withdraw_cash = 0;

        $scope.fetchData = function() {
            Teacher.exchangeinfo({}, function (response) {
                console.log(response);
                $scope.paymentinfo = response.data.paymentinfo;
            });
        };

        $scope.fetchData();
    }
]);

wegenartControllers.controller('TeacherSettingPayDetailCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
        $scope.currentTab = 3;

        Teacher.income_detail({}, function(response){
            console.log(response);
            $scope.incomeinfo = response.data.incomeinfo;
        });
    }
]);

wegenartControllers.controller('TeacherSettingWithdrawDetailCtrl', ['$rootScope', '$scope', 'Teacher',
    function($rootScope, $scope, Teacher){
        $scope.currentTab = 3;

        Teacher.withdraw_detail({}, function(response){
            console.log(response);
            $scope.withdraws = response.data;
        });
    }
]);

wegenartControllers.controller('TeacherSettingPasswordCtrl', ['$rootScope', '$scope', 'Account',
    function($rootScope, $scope, Account) {
        $scope.currentTab = 4;
        $scope.oldpwd = '';
        $scope.newpwd = '';
        $scope.newpwd2 = '';
        $scope.confirm_changes3 = function() {
            if ($scope.newpwd == $scope.newpwd2) {
                Account.changePWD({'oldpassword':$scope.oldpwd, 'newpassword':$scope.newpwd}, function(response) {
                    console.log(response);
                    if (response.errcode == 0) {
                        $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'修改成功！'});
                        $scope.oldpwd = '';
                        $scope.newpwd = '';
                        $scope.newpwd2 = '';
                    } else {
                        $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                    }
                    // if (response.errcode == 0) {
                    //     alert('修改成功');
                    //     $scope.oldpwd = '';
                    //     $scope.newpwd = '';
                    //     $scope.newpwd2 = '';
                    // }
                    // else alert(response.errmessage);
                });
            } else {
                $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':'新密码两次输入不一致'});
                // alert("新密码两次输入不一致");
            }
        };
    }]
);

wegenartControllers.controller('HelpCenterCtrl', ['$rootScope', '$scope', 'Account',
    function($rootScope, $scope, Account){
        $scope.currentTab = 3;
        $scope.faq_click = function(e) {
            console.log(e.target);
            $(e.target).parent().toggleClass('active');
        };

        Account.faq({}, function(resp){
            $scope.faqs = resp.data;
        });
    }
]);

wegenartControllers.controller('JoinUsCtrl', ['$rootScope', '$scope', 'Misc',
    function($rootScope, $scope, Misc){
        $scope.currentTab = 5;
        $scope.joinus_click = function(e) {
            console.log(e.target);
            $(e.target).parent().toggleClass('active');
        };

        Misc.joinus({}, function(resp){
            $scope.result = resp.data;
        });
    }
]);

wegenartControllers.controller('AboutUsCtrl', ['$rootScope', '$scope', 'Misc',
    function($rootScope, $scope, Misc){
        $scope.currentTab = 2;

        Misc.aboutus({}, function(resp){
            $scope.result = resp.data;
        });
    }
]);

wegenartControllers.controller('ContactUsCtrl', ['$rootScope', '$scope', 'Misc',
    function($rootScope, $scope, Misc){
        // $scope.currentTab = 4;

        Misc.contactus({}, function(resp){
            $scope.result = resp.data;
        });
    }
]);

wegenartControllers.controller('PriceSystemCtrl', ['$rootScope', '$scope', 'Misc',
    function($rootScope, $scope, Misc){

        Misc.pricesys({}, function(resp){
            $scope.result = resp.data;
        });
    }
]);


wegenartControllers.controller('HeaderCtrl', ['$rootScope', '$scope', '$interval', 'Teacher', '$location', '$cookieStore', 'Student', 'apiHost',
    function($rootScope, $scope, $interval, Teacher, $location, $cookieStore, Student, apiHost) {
        $scope.showTeacherHeader = $rootScope.uType == roles.teacher;
        $scope.showStudentHeader = $rootScope.uType == roles.student;
        $scope.showAnonymousHeader = $rootScope.uType == roles.anonymous;
        //need auth
        $rootScope.needAuth = function(role) {
            if ($rootScope.uType == role) return false;
            $scope.showNeedAuthModal = true;
            return true;
        };

        $scope.go_auth = function() {
            $cookieStore.put('streturnurl', $location.url());
            $location.url('/signin/');
        };

        $scope.cancel_auth = function() {
            $scope.showNeedAuthModal = false;
        };

        //end need auth


        if ($scope.showTeacherHeader) {
            $scope.refresh_header = function() {
                console.log('teacher header info');
                Teacher.header_info({}, function(response) {
                    if (response.errcode == 0 && response.data) {
                        $scope.students = response.data.mystudents;
                        $scope.notices = response.data.notices;
                    }
                });
            }

            $scope.submit = function () {
                console.log($scope.keyword);
                if ($scope.keyword) {
                    $location.path('/search/teacher/').search('keyword', $scope.keyword);
                }
            }

            $scope.accept = function (eid) {
                var post_data = {
                    event_id: eid,
                    status: 1
                };

                Teacher.handleNotice(post_data, function (data) {
                    console.log(data);

                    for (var i in $scope.notices.unfinished_events) {
                        var obj = $scope.notices.unfinished_events[i];

                        if (obj.id == eid) {
                            $scope.notices.unfinished_events.splice(i, 1);
                            break;
                        }
                    }
                    if (data.errcode == 0) {
                        $rootScope.$broadcast('acceptCourseRequest');
                    }
                }, function (error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错了', 'content':error});
                    // alert(error);
                    console.log(error);
                });
            }

            $scope.reject = function (eid) {
                var post_data = {
                    event_id: eid,
                    status: 2
                };

                Teacher.handleNotice(post_data, function (data) {
                    console.log(data);

                    for (var i in $scope.notices.unfinished_events) {
                        var obj = $scope.notices.unfinished_events[i];

                        if (obj.id == eid) {
                            $scope.notices.unfinished_events.splice(i, 1);
                            break;
                        }
                    }
                }, function (error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错了', 'content':error});
                    // alert(error);
                    console.log(error);
                });
            }

            $scope.viewLessonSidebar = function (lid) {
                $rootScope.$broadcast('viewSidebar', lid, 'lesson');
            }

            $scope.$on('finishSetHomework', function(event, lid) {
                var lessonToRemove = undefined;
                $.each($scope.notices.homework_events, function(i, v){
                    if (lid == v.lesson_id) lessonToRemove = i;
                });
                if (lessonToRemove) $scope.notices.homework_events.splice(lessonToRemove, 1);
            });
        }//end show teacher header
        else if ($scope.showStudentHeader) {//end show student header
            $scope.comment = ['极不满意，老师不认真', '较不满意，老师较敷衍', '一般，勉强满意', '满意，还可以改善', '很满意'];

            $scope.refresh_header = function() {
                console.log('student headfer info');
                Student.header_info({}, function(response) {
                    if (response.errcode == 0 && response.data) {
                        $scope.teachers = response.data.myteachers;
                        $scope.notices = response.data.notices;
                    }
                });
            }

            $scope.payLesson = function(lid) {
                $scope.lessonid = lid;
                Student.lesson_paymentinfo({'lesson_id':lid}, function(response) {
                    console.log(response);
                    if (response.errcode == 0) {
                        $scope.paymentinfo = response.data;
                        $scope.showsPaymentInfo = true;
                    }
                });
            };
            $scope.evaluation = 0;
            $scope.oldevaluation = 0;
            $scope.star_click = function(p) {
                $scope.evaluation = p + 1;
                $scope.oldevaluation = $scope.evaluation;
            };
            $scope.star_mon = function(p) {
                $scope.oldevaluation = $scope.evaluation;
                $scope.evaluation = p + 1;
            };
            $scope.star_moff = function(p) {
                $scope.evaluation = $scope.oldevaluation;
            };


            $scope.cancelPayLesson = function(lid) {
                $scope.showsPaymentInfo = false;
            }

            $scope.review_text = '';
            $scope.go_pay = function() {
                $scope.review_text = $('input[name="review_text"]').val();
                if ($scope.evaluation == 0) { //|| $scope.review_text === ''
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"请先完成评价再付款，谢谢！"});
                    return;
                }
                $scope.showsPaymentInfo = false;
                $scope.showsPaymentInfo2 = true;
                $scope.paymethod = $('input[name="pay_method"]:checked').attr('paymethod');
                window.open(apiHost + "/student/lesson_pay/?token=" + $cookieStore.get('token') + "&uid=" + $cookieStore.get('uid') + "&lesson_id=" + $scope.lessonid + "&comment=" + $scope.review_text + "&evaluation=" + $scope.evaluation + "&type=" + $('input[name="pay_method"]:checked').val());

            }

            $scope.pay_finish = function() {
                Student.check_pay({'type':0, 'id':$scope.lessonid}, function(response){
                    if (response.errcode == 0 && response.data.is_paid) {
                        $scope.showsPaymentInfo2 = false;
                        $scope.showsPaymentInfo3 = true;
                    } else {
                        $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"订单未支付成功，请稍后重试！"});
                        // alert("订单未支付成功，请稍后重试！");
                    }
                });
            }

            $scope.pay_problem = function() {
                $scope.showsPaymentInfo2 = false;
                $scope.showsPaymentInfo = true;
            }

            $scope.pay_confirmed = function() {
                $scope.showsPaymentInfo3 = false;
            }

            $scope.submit = function(){
              console.log($scope.keyword);
              // if($scope.keyword){
                $location.path('/search/teacher/').search('keyword', $scope.keyword);
              // }
            }

            $scope.accept = function(eid, url) {
                var post_data = {
                    event_id: eid,
                    status: 1
                };

                Student.handleNotice(post_data, function(data) {
                    console.log(data);

                    for (var i in $scope.notices.unfinished_events) {
                        var obj = $scope.notices.unfinished_events[i];

                        if (obj.id == eid) {
                            $scope.notices.unfinished_events.splice(i, 1);
                            break;
                        }
                    }
                    if (url != undefined) $location.url(url);
                }, function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':"error"});
                    // alert(error);
                    console.log(error);
                });
            };

            $scope.reject = function(eid) {
                var post_data = {
                    event_id: eid,
                    status: 2
                };

                Student.handleNotice(post_data, function(data) {
                    console.log(data);

                    for (var i in $scope.notices.unfinished_events) {
                        var obj = $scope.notices.unfinished_events[i];

                        if (obj.id == eid) {
                            $scope.notices.unfinished_events.splice(i, 1);
                            break;
                        }
                    }
                }, function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':"error"});
                    // alert(error);
                    console.log(error);
                });
            }

            $scope.readEvent = function(eid) {
                var post_data = {
                    event_id: eid,
                    status: 1
                };

                Student.handleNotice(post_data, function(data) {
                    console.log(data);

                    for (var i in $scope.notices.unfinished_events) {
                        var obj = $scope.notices.unfinished_events[i];

                        if (obj.id == eid) {
                            $scope.notices.unfinished_events.splice(i, 1);
                            break;
                        }
                    }

                    // jump to the timeline page
                    $location.url('/student/timeline/?event={0}'.format(eid));
                }, function(error) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':"error"});
                    // alert(error);
                    console.log(error);
                });
            }
        }
        else {
            $scope.submit = function(){
              console.log($scope.keyword);
              // if($scope.keyword){
                $location.path('/search/teacher/').search('keyword', $scope.keyword);
              // }
            }
        }
        if ($scope.refresh_header) {
            $scope.refresh_header();
            $rootScope.refresh_header_timer = $interval(function () {
                $scope.refresh_header();
            }, 1000 * 30);
        }
    }
]);

wegenartControllers.controller('ConfirmModalCtrl', ['$rootScope', '$scope',
    function($rootScope, $scope){
        $scope.showupConfirmModal = false;
        $rootScope.$on('showConfirmModal', function(event, params) {
            console.log("recv show confirm modal req");
            $scope.showNegative = false;
            $scope.msg = params;
            $scope.showupConfirmModal = true;
        });

        $rootScope.$on('showConfirmTwoModal', function(event, params) {
            console.log("recv show confirm two modal req");
            $scope.showNegative = true;
            $scope.msg = params;
            $scope.showupConfirmModal = true;
        });

        $scope.clickPositive = function() {
            $scope.showupConfirmModal=false;
            if ($scope.msg.clickPositive) {
                $scope.msg.clickPositive();
            }
        };

        $scope.clickNegative = function() {
            $scope.showupConfirmModal=false;
            if ($scope.msg.clickNegative) {
                $scope.msg.clickNegative();
            }
        };
    }
]);

wegenartControllers.controller('RecoverPasswordCtrl', ['$rootScope', '$scope', '$routeParams', 'Account',
    function($rootScope, $scope, $routeParams, Account){
        $scope.submit = function() {
            console.log('recover password for' + $scope.emailOrPhone);
            Account.forgot_password_email({'email':$scope.emailOrPhone}, function(response){
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'用于找回密码的邮件已发送到您的邮箱' + $scope.emailOrPhone +  '. 请注意查收.'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
            });
        };
    }
]);

wegenartControllers.controller('ResetPasswordCtrl', ['$rootScope', '$scope', '$routeParams', 'Account', '$cookieStore',
    function($rootScope, $scope, $routeParams, Account, $cookieStore){
        $scope.submit = function() {
            Account.set_new_password({'passwordtoken':$routeParams.token, 'newpassword':$scope.newpwd}, function(response){
                if (response.errcode == 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':'密码修改成功！'});
                } else {
                    $rootScope.$broadcast('showConfirmModal', {'title':'出错啦', 'content':response.errmessage});
                }
            });
        };
    }
]);

var utils = {
  groupTimelineByDate : function(timeline) {
      var ret = {};

      for (var i in timeline) {
          var obj = timeline[i];

          var datetime = new Date(obj.createtime);
          var date = new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate());
          var date_str = date.toISOString();

          if (ret[date_str] == undefined) {
              ret[date_str] = [];
          }

          ret[date_str].push(obj);
      }

      return ret;
  },

  toDictionaryArray : function(obj) {
      if (!(obj instanceof Object)) return obj;

      var arr = [];
      for (var key in obj) {
          arr.push({
              datestr: key,
              date: new Date(key),
              events: obj[key]
          });
      }

      return arr;
  }
}

var uiutils = {
    setup_day_selector : function() {
        $('select[name="birth-year"]').change(function(){
            changeMonth();
        });
        $('select[name="birth-month"]').change(function(){
            changeMonth();
        });
    },
    add_setting_item : function(target, container) {
        var value = target.val();
        target.val('');
        uiutils.add_setting_item_value(value, container);
    },
    add_setting_item_value:function(value, container) {
        if (value == "" || value == undefined) return;
        var content =
            '<li class="settings-list-item"><a class="settings-list-inner" value="' + value + '">' +
                                    value +
                                    '<span href="" class="delete-list-item">\
                                        <i class="icon icon-delete-square-grey"></i>\
                                        <span class="hidden">删除</span>\
                                    </span>\
                                </a></li>';

        container.append($(content));
        $('.delete-list-item').click(function(){
            $(this)[0].parentNode.parentNode.remove();
        });
    },
    setup_age_level_select : function() {
        $('input[name="stu_age"]').change(function() {
            if ($(this).val() >= 0) {
                console.log($(this).attr('checked'));
                if ($(this).attr('checked') == undefined) $($('input[name="stu_age"]')[0]).attr('checked', false);
                return;
            }
            $('input[name="stu_age"]').attr('checked',$('input[name="stu_age"]')[0].checked);
        });
        $('input[name="stu_level"]').change(function() {
            if ($(this).val() >= 0) {
                if ($(this).attr('checked') == undefined) $($('input[name="stu_level"]')[0]).attr('checked', false);
                return;
            }
            $('input[name="stu_level"]').attr('checked',$('input[name="stu_level"]')[0].checked);
        });
    },
    upload_avatar : function(fileUpload, $rootScope, $scope) {
        $('.input-avatar').change(function() {
            if ($(this)[0].files[0] === undefined) return;
            $('.upload-avatar').html("上传中...");
            fileUpload.uploadFileToUrl($(this)[0].files[0], function(response) {
                if (response.errcode > 0) {
//                    $scope.$apply(function(){
                        $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"上传失败, 请注意上传的图片文件名不要包含中文"});
//                        });
                    $('.upload-avatar').html("上传头像");
                    return;
                }
                $scope.avatar_id = response.data.avatar_id;
                $('.avatar').attr('src', response.data.avatar_url);
                $('.upload-avatar').html("重新上传头像");
            });
            return false;
        });
    },
    get_setting_items : function(id) {
        var ret = '';
        $.each($('#' + id + ' .settings-list a'), function(i,v){if ($(v).attr('value')) ret += $(v).attr('value') + '$';});
        return ret;
    },
    upload_image : function(fileUpload, $rootScope, $scope, inputEle, statusButton, callback) {
        inputEle.change(function() {
            if ($(this)[0].files[0] === undefined) return;
            var oritext = statusButton.html();
            statusButton.html("上传中...");
            fileUpload.uploadFileToUrl($(this)[0].files[0], function(response) {
                if (response.errcode > 0) {
                    $rootScope.$broadcast('showConfirmModal', {'title':'提示', 'content':"上传失败, 请注意上传的图片文件名不要包含中文"});
                    statusButton.html(oritext);
                    return;
                }
                if (callback) callback(response.data.avatar_id, response.data.avatar_url);
                statusButton.html("已上传成功");
            });
            return false;
        });
    },
};

var changeMonth = function()
{
    var monthVal = $('select[name="birth-month"]').val();
    var yearVal = $('select[name="birth-year"]').val();
    if ( monthVal==4 || monthVal==6 || monthVal==9 || monthVal==11 ) updateDays(30);
    else if ( monthVal == 2 )
    {
        var isleap = (yearVal % 4 == 0 && (yearVal % 100 != 0 || yearVal % 400 == 0));
        if ( isleap ) updateDays( 29);
        else updateDays( 28);
    }
    else updateDays( 31);
};
var updateDays = function( daysCount )
{
    if( $('select[name="birth-day"]').find('option[value!=""]').size() == daysCount ) return;
    var dayValue = $('select[name="birth-day"]').val();
    $('select[name="birth-day"]').find('option[value!=\'\']').remove();
    if( !dayValue ) dayValue = '25';
    else if ( dayValue > daysCount ) dayValue = daysCount;
    var dayFirstOption = $('<option>');
    for ( var i=1; i<= daysCount; i++ )
    {
        var $option = dayFirstOption.clone();
        $option.text(i);
        $option.val(i < 10 ? "0" + i : i);
        if ( dayValue == i ) $option.attr('selected', 'selected');
        $('select[name="birth-day"]').append($option);
    }
};

var goodChar ="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
goodChar += "abcdefghijklmnopqrstuvwxyz";
goodChar += "0123456789";

var vaildpasswd = function(p) {
    console.log(p.length);
    if (p == undefined) return false;
    if (p.length < 6 || p.length > 18) return false;
    var i = 0;
    for (i = 0; i < p.length; i ++) {
        if (goodChar.indexOf(p[i]) < 0) return false;
    }
    return true;
};
