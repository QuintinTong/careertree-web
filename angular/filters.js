'use strict';

/* Filters */

var wegenartFilters = angular.module('wegenartFilters', []);

wegenartFilters.filter('gender', function() {
    return function(input) {
        if (input == 0) {
            return '女';
        } else if (input == 1) {
            return '男';
        } else if (input == 2) {
            return '未知';
        } else {
            return '无效';
        }
    };
})

wegenartFilters.filter('graduateUniversity', function() {
    return function(obj) {
        if (obj){
            var date = new Date(obj.graduation_year);
            var short_year = date.getFullYear().toString().substring(2);
            return '{0} - {1} {2} 师承 {3}'.format(obj.school, obj.college, short_year, obj.master);
        }else{
            return ""
        };
    };
})

wegenartFilters.filter('instrument_level', function() {
    return function(input) {
        if (input == '1') {
            return '初级';
        } else if (input == '2') {
            return '中级';
        } else if (input == '3') {
            return '高级';
        } else if (input == '4') {
            return '演奏级';
        } else if (input == '5') {
            return '艺考';
        }
    };
})

wegenartFilters.filter('teacherTypeFilter', function() {
    return function(data, index) {
        if (index == 0) {
            return data;
        }

        var instru = $(".tag-item[ng-click='changeTab({0})']".format(index)).text();

        return data.filter(function(el) {
            return el.instrument == instru;
        });
    };
})

wegenartFilters.filter('fancyDate', function() {
    return function(timestr) {
        var DateDiff = {

            inMinutes: function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseInt((t2-t1)/(60*1000));
            },

            inHours: function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseInt((t2-t1)/(3600*1000));
            },

            inDays: function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseInt((t2-t1)/(24*3600*1000));
            },

            inWeeks: function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseInt((t2-t1)/(24*3600*1000*7));
            },

            inMonths: function(d1, d2) {
                var d1Y = d1.getFullYear();
                var d2Y = d2.getFullYear();
                var d1M = d1.getMonth();
                var d2M = d2.getMonth();

                return (d2M+12*d2Y)-(d1M+12*d1Y);
            },

            inYears: function(d1, d2) {
                return d2.getFullYear()-d1.getFullYear();
            }
        }


        var now = new Date();
        var time = new Date(timestr);

        if (time > now) {
            return "现在";
        } else if (time == now) {
            return "现在";
        } else {
            var diff = now - time; // in milliseconds

            var minute = 1000 * 60,
                hour = 1000 * 60 * 60,
                day = 1000 * 60 * 60 * 24,
                week = 1000 * 60 * 60 * 24 * 7;

            if (diff < minute) {
                return "刚才";
            } else if (diff < hour) {
                return "{0} 分钟前".format(DateDiff.inMinutes(time, now));
            } else if (diff < day) {
                return "{0} 小时前".format(DateDiff.inHours(time, now));
            } else if (diff < week) {
                return "{0} 天前".format(DateDiff.inDays(time, now));
            } else {
                return "{0} 天前".format(DateDiff.inDays(time, now));
            }
        }
    };
})

wegenartFilters.filter('lessonStatusFilter', function() {
    return function(data, status) {
        if (status === null) {
            return data;
        }

        return data.filter(function(el) {
            return el.lesson_info && el.lesson_info.status == status;
        });
    };
})

wegenartFilters.filter('range', function() {
	return function(input, max) {
	    max = parseInt(max);
	    for (var i=0; i<max; i++)
	      input.push(i);
	    return input;
	}
})

wegenartFilters.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

wegenartFilters.filter('round', function() {
  return function(item) {
    return Math.round(item);
  };
});