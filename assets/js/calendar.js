function WGCalendar() {

    var lesson_statuses = ['unrated', 'unpaid', 'completed', 'trial', 'planned', 'untrial'];

    /*
     * Date Format 1.2.3
     * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
     * MIT license
     *
     * Includes enhancements by Scott Trenda <scott.trenda.net>
     * and Kris Kowal <cixar.com/~kris.kowal/>
     *
     * Accepts a date, a mask, or a date and a mask.
     * Returns a formatted version of the given date.
     * The date defaults to the current date/time.
     * The mask defaults to dateFormat.masks.default.
     */

    var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function(val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure
        return function(date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    ddd: dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings
    dateFormat.masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    var getMonday = function(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    var getSunday = function(d) {
        d = new Date(d);
        var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? 0 : 7); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    var getWeekOfMonth = function(date) {
        var adjustedDate = date.getDate() + 1;
        prefixes = ['0', '1', '2', '3', '4', '5'];
        return prefixes[0 | adjustedDate / 7];
    };

    var getDiffDays = function(date1, date2) {
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        return diffDays;
    };

    var getDateByCoordinate = function(firstMonthDay, coordinate) {
        // coordinate {x, y}
        var firstDay = getMonday(firstMonthDay);
        // add days
        var numberOfDaysToAdd = coordinate.x * 7 + coordinate.y;
        var resultDay = firstDay;
        resultDay.setDate(firstDay.getDate() + numberOfDaysToAdd);
        return resultDay;
    };

    var getCoordinateByDate = function(firstMonthDay, date) {
        var firstDay = getMonday(firstMonthDay);
        var diffDays = getDiffDays(date, firstDay);

        return {
            x: ~~((diffDays) / 7),
            y: diffDays % 7
        };
    };

    var firstMonthDay = function(date) {
        var firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return firstMonthDay;
    };

    var lastMonthDay = function(date) {
        var lastMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastMonthDay;
    };

    var renderCalendar = function(firstDay) {
        var lastDay = lastMonthDay(firstDay);
        var today = new Date();
        var weeks = parseInt(getWeekOfMonth(lastDay)) + 1;
        var data = [];

        for (var x = 0; x < weeks; x++) {
            var row = [];
            for (var y = 0; y < 7; y++) {
                var date = getDateByCoordinate(firstDay, {
                    x: x,
                    y: y
                });

                var result = {
                    date: date,
                    list: [],
                    free: []
                };
                if (today.isSameDateAs(date)) {
                    result.today = '今天';
                }

                if (date.getDate() == 1) {
                    var monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
                    result.month = monthNames[date.getMonth()] + '月';
                }
                row.push(result);
            }
            data.push(row);
        }

        return data;
    };

    var renderWeekItems = function(firstDay, calendar, data) {
        $.each(calendar, function(index, val) {
            var start_date = new Date(val['start_date']);
            var end_date = new Date(val['end_date']);
            var status = val['status'];

            var item = {
                id: val['id'],
                start_date: start_date,
                end_date: end_date,
                duration: Math.round((end_date - start_date)/3600/100)/10,
                status: status,
                class_place: val['class_place'],
                class_place_addr: val['class_place_addr']
            };

            if (status === 0) {
                var lesson_info  = val['lesson_info'];
                var student_info = lesson_info['student_info'];
                var avatar       = student_info['avatar'];
                var name         = student_info['name'];

                var lesson_start_date       = new Date(lesson_info['start_date']);
                var lesson_end_date         = new Date(lesson_info['end_date']);

                lesson_info.start_date = lesson_start_date;
                lesson_info.end_date = lesson_end_date;

                var lesson_info_status = val['lesson_info']['status'];
                lesson_info.lesson_status = lesson_statuses[lesson_info_status];

                item.avatar = avatar;
                item.name = name;
                item.lesson_info = lesson_info;
            }

            data[(start_date.getDay() + 6) % 7].push(item);
        });

        return data;
    };

    var renderCalendarItems = function (firstDay, calendar, data) {
        $.each(calendar, function(index, val) {
            var start_date = new Date(val['start_date']);
            var end_date = new Date(val['end_date']);
            var coordinate = getCoordinateByDate(firstDay, start_date);
            var cell = data[coordinate.x][coordinate.y];

            cell.busy = true;

            var status = val['status'];

            var item = {
                start_date: start_date,
                end_date: end_date,
                duration: Math.round((end_date - start_date)/3600/100)/10,
                status: status,
                class_place: val['class_place'],
                class_place_addr: val['class_place_addr']
            };

            if (status === 0) {
                var lesson_info  = val['lesson_info'];
                var student_info = lesson_info['student_info'];
                var avatar       = student_info['avatar'];
                var name         = student_info['name'];

                var lesson_start_date       = new Date(lesson_info['start_date']);
                var lesson_end_date         = new Date(lesson_info['end_date']);

                lesson_info.start_date = lesson_start_date;
                lesson_info.end_date = lesson_end_date;

                var lesson_info_status = val['lesson_info']['status'];
                lesson_info.lesson_status = lesson_statuses[lesson_info_status];

                item.avatar = avatar;
                item.name = name;
                item.lesson_info = lesson_info;

                if (cell.list == undefined) cell.list = [];
                cell.list.push(item);
            } else {
                if (cell.free == undefined) cell.free = [];
                cell.free.push(item);
            }
        });

        return data;
    };

    return {
        dateFormat: dateFormat,
        getMonday: getMonday,
        getSunday: getSunday,
        firstMonthDay: firstMonthDay,
        lastMonthDay: lastMonthDay,
        renderCalendar: renderCalendar,
        renderWeekItems: renderWeekItems,
        renderCalendarItems: renderCalendarItems
    }
}