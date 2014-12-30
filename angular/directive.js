var wegenartDirectives = angular.module('wegenartDirectives', []);

wegenartDirectives.directive("tree", function($compile) {
    //Here is the Directive Definition Object being returned 
    //which is one of the two options for creating a custom directive
    //http://docs.angularjs.org/guide/directive
    return {
        restrict: "E",
        //We are stating here the HTML in the element the directive is applied to is going to be given to
        //the template with a ng-transclude directive to be compiled when processing the directive
        transclude: true,
        scope: {family: '='},
        template:       
            '<ul>' + 
                //Here we have one of the ng-transclude directives that will be give the HTML in the 
                //element the directive is applied to
                '<li ng-transclude></li>' +
                '<li ng-repeat="child in family.children">' +
                    //Here is another ng-transclude directive which will be given the same transclude HTML as
                    //above instance
                    //Notice that there is also another directive, 'tree', which is same type of directive this 
                    //template belongs to.  So the directive in the template will handle the ng-transclude 
                    //applied to the div as the transclude for the recursive compile call to the tree 
                    //directive.  The recursion will end when the ng-repeat above has no children to 
                    //walkthrough.  In other words, when we hit a leaf.
                    '<tree family="child"><div ng-transclude></div></tree>' +
                '</li>' +
            '</ul>',
        compile: function(tElement, tAttr, transclude) {
            //We are removing the contents/innerHTML from the element we are going to be applying the 
            //directive to and saving it to adding it below to the $compile call as the template
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                
                if(!compiledContents) {
                    //Get the link function with the contents frome top level template with 
                    //the transclude
                    compiledContents = $compile(contents, transclude);
                }
                //Call the link function to link the given scope and
                //a Clone Attach Function, http://docs.angularjs.org/api/ng.$compile :
                // "Calling the linking function returns the element of the template. 
                //    It is either the original element passed in, 
                //    or the clone of the element if the cloneAttachFn is provided."
                compiledContents(scope, function(clone, scope) {
                        //Appending the cloned template to the instance element, "iElement", 
                        //on which the directive is to used.
                         iElement.append(clone); 
                });
            };
        }
    };
});

wegenartDirectives.directive('fixPageSize', function() {
  function link(scope, element, attrs){
    element.height($(window).height());
    if(attrs.fixPageSize=='hard'){
      element.attr('width', $(window).width());
      element.attr('height', $(window).height());
      $(window).resize(function(){
        var ele = element.parent().find('video, .sublimevideo-ImageView, .sublimevideo-VideoView, .sublimevideo-Video').attr('width', $(window).width());
        angular.forEach(ele, function(item){
          var cssText = $(item).attr('style');
          $(item).attr('style', cssText.replace(/width: \d+px/gi, 'width: '+$(window).width()+'px'));
        });
      })
    }
  }
  
  return {
      restrict: 'A',
      link: link
    };
});


wegenartDirectives.directive('videoContainer', function() {
  function link(scope, element, attrs){
    var playerId = 'a240e92d';
    scope.videoLoadStart = false;
    sublime.load();
    
    element.find('video').on('loadstart', function(){
      scope.$apply(function(){
         scope.videoLoadStart = true;
      });
    });
    
    scope.stopVideo = function(){
      sublime(playerId).stop();
    }
    
    scope.changeVideo = function(videoItem){
      var videoEle = element.find('video');
      var videoPack = [videoItem.url1, videoItem.url2].filter(function(i){ return i});
      sublime.unprepare(playerId);
      console.log(videoPack);
      if(videoPack.length){
        videoEle.html('');
        for (var i = 0; i < videoPack.length; i++) {
            videoEle.append($('<source>').attr('src', videoPack[i]));
        };
      }
      
      videoEle.attr('width', element.width());
      videoEle.attr('height', element.height());
      sublime.prepare(playerId, scope.videoPlay);
    }
    
    scope.videoPlay = function(){
      element.find('.hide-on-play').fadeOut({
        duration: 1000,
        complete: function(){
          scope.$apply(function(){
             scope.showVideo = true;
          });
          checkLoop();

          setTimeout(function(){
            sublime(playerId).play();
          });
        }
      });
    }
    
    function checkLoop(){
      if(element.find('.sublimevideo-ImageView').length){
        var imgUrl = element.find('.sublimevideo-ImageView img').attr('src');
        if(imgUrl){
          element.find('.sublimevideo-ImageView').html($('<div>')
                                                 .addClass('img-alternative')
                                                 .css(
                                                   'cssText',
                                                   'background-image: url("'+imgUrl+'") !important;'+
                                                   'background-size: cover !important;'+
                                                   'background-position: center !important;'+
                                                   'background-repeat: no-repeat !important;'+
                                                   'height: 100%'));
        }
        var bp = element.find('.sublimevideo-Button').parent();
        bp.attr('style', bp.attr('style')+';z-index:999 !important');
        var player = sublime.player(playerId);
        player.on('pause', function(){
          element.find('.show-on-pause').fadeIn();
        })
        player.on('play', function(){
          element.find('.show-on-pause').fadeOut();
        })
        player.on('stop', function(){
          scope.$apply(function(){
             scope.showVideo = false;
          });
          element.find('.hide-on-play').fadeIn();
        });
      }else{
        setTimeout(checkLoop, 200);
      }
    }
  };
  
  return {
      restrict: 'A',
      link: link
    };
});

wegenartDirectives.directive('checkboxAll', ['$filter', function ($filter) {
  return function(scope, iElement, iAttrs) {
		var parts = iAttrs.checkboxAll.split('.');
		var items = parts[0];
		var prop = parts[1];
		
		function changeState(checked, indet) {
        iElement.prop('checked', checked).prop('indeterminate', indet);
    }
    function updateItems() {
        angular.forEach(scope.$eval(items), function(el) {
            el[prop] = iElement.prop('checked');
        });
    }
    iElement.bind('change', function() {
        scope.$apply(function() { updateItems(); });
    });
    scope.$watch(items, function(newValue) {
        var checkedItems = $filter('filter')(newValue, function(el) {
            return el[prop];
        });
        switch(checkedItems ? checkedItems.length : 0) {
            case 0:                // none selected
                changeState(false, false);
                break;
            case newValue.length:  // all selected
                changeState(true, false);
                break;
            default:               // some selected
                changeState(false, true);
        }
    }, true);
    updateItems();
  };
}]);

wegenartDirectives.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

wegenartDirectives.directive('eventOption', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(attrs['eventOption'], function(value) {
                var box_h = 40;
                var start = value.start;
                var end = value.end;
                var top = (start.getHours() * 2 - 13) * box_h + start.getMinutes() * box_h / 30.0 + 'px';
                var height = (end - start) / 60000 * box_h / 30.0 + 'px';
                element.css({top:top,height:height});
            });

        }
    };
}]);

// week calendar item draggable event
wegenartDirectives.directive('draggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var dragging = false, column = 0, startY = 0, box_h = 40, top = 0, height = 1, show_event = false;
            var $el = $("<div class='reservation-item new-schedule'></div>");

            scope.removeElement = function (e) {
                $el.removeClass('active').remove();
                dragging = false;
                show_event = false;

                scope.$apply(function () {
                    scope.$broadcast('dismissReservationPopup');
                });
            };

            scope.$on('didDismissPopup', function () {
                scope.removeElement();
            });

            scope.$on('didChangeNewReservationDate', function (event, value) {
                if (show_event) {
                    var new_top = value.startDate.getHours() * 2 - 13 + value.startDate.getMinutes() / 30.0;
                    var new_bottom = value.endDate.getHours() * 2 - 13 + value.endDate.getMinutes() / 30.0;
                    var new_height = new_bottom - new_top;

                    $el.css({top: new_top * box_h, height: new_height * box_h});
                    scope.$broadcast('didChangePopupTop', {top: (new_top - 0.5) * box_h});
                }
            });

            // start
            element.bind('mousedown', function (e) {
                if ($(e.target).hasClass('day-item') && !show_event) {
                    e.preventDefault();
                    dragging = true;
                    show_event = true;
                    height = 1;
                    column = $(e.target).index();
                    startY = Math.floor(e.pageY / box_h);
                    top = Math.floor(e.offsetY / box_h);

                    // custom
                    $el.css({top: top * box_h, height: box_h}).addClass('active').appendTo($(e.target));
                }
                else if ($(e.target).parents('.popup-item').size() == 0) {
                    scope.removeElement(e);
                }
            });

            // move
            element.bind('mousemove', function (e) {
                if (dragging == true) {
                    height = Math.max(1, Math.floor(e.pageY / box_h + 1 - startY));
                    var css_height = height * box_h;
                    $el.height(css_height);
                }
            });

            // end
            element.bind('mouseup', function (e) {
                if (dragging == true) {
                    dragging = false;

                    var css_height = height * box_h;
                    $el.height(css_height);

                    var left = $('.day-item').width() * (column + 1);

                    var startDate = new Date(0);
                    startDate.setTime(startDate.getTimezoneOffset() * 60000);
                    startDate.setHours(startDate.getHours() + 6);
                    startDate.setMinutes(startDate.getMinutes() + top * 30 + 30);

                    var endDate = new Date(startDate);
                    endDate.setMinutes(endDate.getMinutes() + height * 30);

                    var wgcalendar = WGCalendar();
                    var current_date = wgcalendar.getMonday(scope.date);
                    var selected_day = new Date(current_date.getTime());
                    selected_day.setDate(selected_day.getDate() + column);

                    console.log(selected_day);

                    scope.$apply(function () {
                        var params = {
                            date: selected_day,
                            startDate: startDate,
                            endDate: endDate,
                            position: {left: left, top: (top - 0.5) * box_h}
                        };
                        scope.$broadcast('prepareReservationPopup', params);
                    });

                }
            });

            // cancel
            element.bind('mouseleave', function (e) {
                if (dragging == true) {
                    scope.removeElement(e);
                }
            });
        }
    };
});

wegenartDirectives.directive('reservationPopup', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div ng-include="reservationPopupUrl"></div>',
        controller: 'ReservationPopupCtrl',
        link: function (scope, element, attrs) {
            scope.reservationPopupUrl = attrs.role + '/reservation_popup.html';
            scope.showsRepeat = attrs.showsRepeat;

            attrs.$observe("role", function (role) {
                scope.reservationPopupUrl = role + '/reservation_popup.html';
            });

            attrs.$observe("showsRepeat", function (showsRepeat) {
                scope.showsRepeat = showsRepeat;
            });
        }
    }
});

wegenartDirectives.directive('sidebar', function () {
    return {
        restrict: 'E',
        replace: true,
        template: '<div ng-include="sidebarContentUrl"></div>',
        link: function (scope, element, attrs) {
            scope.sidebarContentUrl = 'teacher/student/sidebar/' + attrs.type + '.html';
            attrs.$observe("type", function (type) {
                scope.sidebarContentUrl = 'teacher/student/sidebar/' + type + '.html';
            });
        }
    }
});

wegenartDirectives.directive("outsideClick", ['$document','$parse', function( $document, $parse ){
    return {
        link: function( $scope, $element, $attributes ){
            var scopeExpression = $attributes.outsideClick,
                onDocumentClick = function(event){
                    var isChild = $element.find(event.target).length > 0;

                    if(!isChild) {
                        $scope.$apply(scopeExpression);
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        }
    }
}]);

wegenartDirectives.directive('onFinishRender', function($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, element, attr) {
            if ($scope.$last === true) {
                $timeout(function () {
                    $scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});
//
//wegenartDirectives.directive('chosen', function() {
//  var linker = function(scope, element, attr) {
//        // update the select when data is loaded
//        scope.$watch(attr.chosen, function(oldVal, newVal) {
//            element.trigger('chosen:updated');
//        });
//
//        // update the select when the model changes
//        scope.$watch(attr.ngModel, function() {
//            element.trigger('chosen:updated');
//        });
//
//        element.chosen();
//    };
//
//    return {
//        restrict: 'A',
//        link: linker
//    };
//});