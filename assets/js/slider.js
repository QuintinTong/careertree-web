/**
 *  全局函数处理
 *  -----------------------------
 *  作者：叼怎么写！- -||
 *  时间：2014-03-26
 *  准则：Zpote、字面量对象
 *  联系：wechat--shoe11414255
 *  一张网页，要经历怎样的过程，才能抵达用户面前
 *  一个特效，要经历这样的修改，才能让用户点个赞
 *  一个产品，创意源于生活，源于内心，需要慢慢品味
 *********************************************************************************************/
var car2 = {
/****************************************************************************************************/
/*  对象私有变量/函数返回值/通用处理函数
*****************************************************************************************************/	
/*************************
 *  = 对象变量，判断函数
 *************************/
	_events 		: {},									// 自定义事件---this._execEvent('scrollStart');
	_windowHeight	: $(window).height(),					// 设备屏幕高度
	_windowWidth 	: $(window).width(),

	_rotateNode		: $('.p-ct'),							// 旋转体

	_page 			: $('.m-page'),							// 模版页面切换的页面集合
	_pageNum		: $('.m-page').size(),					// 模版页面的个数
	_pageNow		: 0,									// 页面当前的index数
	_pageNext		: null,									// 页面下一个的index数

	_touchStartValY	: 0,									// 触摸开始获取的第一个值
	_touchDeltaY	: 0,									// 滑动的距离

	_moveStart		: true,									// 触摸移动是否开始
	_movePosition	: null,									// 触摸移动的方向（上、下）
	_movePosition_c	: null,									// 触摸移动的方向的控制
	_mouseDown		: false,								// 判断鼠标是否按下
	_moveFirst		: true,
	_moveInit		: false,

	_firstChange	: false,

	_map 			: $('.ylmap'),							// 地图DOM对象
	_mapValue		: null,									// 地图打开时，存储最近打开的一个地图
	_mapIndex		: null,									// 开启地图的坐标位置

	_audioNode		: $('.u-audio'),						// 声音模块
	_audio			: null,									// 声音对象
	_audio_val		: true,									// 声音是否开启控制
	
	_elementStyle	: document.createElement('div').style,	// css属性保存对象

	_UC 			: RegExp("Android").test(navigator.userAgent)&&RegExp("UC").test(navigator.userAgent)? true : false,
	_weixin			: RegExp("MicroMessenger").test(navigator.userAgent)? true : false,
	_iPhoen			: RegExp("iPhone").test(navigator.userAgent)||RegExp("iPod").test(navigator.userAgent)||RegExp("iPad").test(navigator.userAgent)? true : false,
	_Android		: RegExp("Android").test(navigator.userAgent)? true : false,
	_IsPC			: function(){ 
						var userAgentInfo = navigator.userAgent; 
						var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"); 
						var flag = true; 
						for (var v = 0; v < Agents.length; v++) { 
							if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; } 
						} 
						return flag; 
					} ,

/***********************
 *  = gobal通用函数
 ***********************/
 	// 判断函数是否是null空值
	_isOwnEmpty		: function (obj) { 
						for(var name in obj) { 
							if(obj.hasOwnProperty(name)) { 
								return false; 
							} 
						} 
						return true; 
					},
	// 微信初始化函数
	_WXinit			: function(callback){
						if(typeof window.WeixinJSBridge == 'undefined' || typeof window.WeixinJSBridge.invoke == 'undefined'){
							setTimeout(function(){
								this.WXinit(callback);
							},200);
						}else{
							callback();
						}
					},
	// 判断浏览器内核类型
	_vendor			: function () {
						var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
							transform,
							i = 0,
							l = vendors.length;
				
						for ( ; i < l; i++ ) {
							transform = vendors[i] + 'ransform';
							if ( transform in this._elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
						}
						return false;
					},
	// 判断浏览器来适配css属性值
	_prefixStyle	: function (style) {
						if ( this._vendor() === false ) return false;
						if ( this._vendor() === '' ) return style;
						return this._vendor() + style.charAt(0).toUpperCase() + style.substr(1);
					},
	// 判断是否支持css transform-3d（需要测试下面属性支持）
	_hasPerspective	: function(){
						var ret = this._prefixStyle('perspective') in this._elementStyle;
						if ( ret && 'webkitPerspective' in this._elementStyle ) {
							this._injectStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
								ret = node.offsetLeft === 9 && node.offsetHeight === 3;
							});
						}
						return !!ret;
					},
		_translateZ : function(){
						if(car2._hasPerspective){
							return ' translateZ(0)';
						}else{
							return '';
						}
					},

	// 判断属性支持是否
	_injectStyles 	: function( rule, callback, nodes, testnames ) {
						var style, ret, node, docOverflow,
							div = document.createElement('div'),
							body = document.body,
							fakeBody = body || document.createElement('body'),
							mod = 'modernizr';

						if ( parseInt(nodes, 10) ) {
							while ( nodes-- ) {
								node = document.createElement('div');
								node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
								div.appendChild(node);
								}
						}

						style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
						div.id = mod;
						(body ? div : fakeBody).innerHTML += style;
						fakeBody.appendChild(div);
						if ( !body ) {
							fakeBody.style.background = '';
							fakeBody.style.overflow = 'hidden';
							docOverflow = docElement.style.overflow;
							docElement.style.overflow = 'hidden';
							docElement.appendChild(fakeBody);
						}

						ret = callback(div, rule);
						if ( !body ) {
							fakeBody.parentNode.removeChild(fakeBody);
							docElement.style.overflow = docOverflow;
						} else {
							div.parentNode.removeChild(div);
						}

						return !!ret;
					},
	// 自定义事件操作
 	_handleEvent 	: function (type) {
						if ( !this._events[type] ) {
							return;
						}

						var i = 0,
							l = this._events[type].length;

						if ( !l ) {
							return;
						}

						for ( ; i < l; i++ ) {
							this._events[type][i].apply(this, [].slice.call(arguments, 1));	
						}
					},
	// 给自定义事件绑定函数
	_on				: function (type, fn) {
						if ( !this._events[type] ) {
							this._events[type] = [];
						}

						this._events[type].push(fn);
					},
	//禁止滚动条
	_scrollStop		: function(){
						//禁止滚动
						$(window).on('touchmove.scroll',this._scrollControl);
						$(window).on('scroll.scroll',this._scrollControl);
					},
	//启动滚动条
	_scrollStart 	: function(){		
						//开启屏幕禁止
						$(window).off('touchmove.scroll');
						$(window).off('scroll.scroll');
					},
	//滚动条控制事件
	_scrollControl	: function(e){e.preventDefault();},

/**************************************************************************************************************/
/*  关联处理函数
***************************************************************************************************************/
/**
 *  单页面-m-page 切换的函数处理
 *  -->绑定事件
 *  -->事件处理函数
 *  -->事件回调函数
 *  -->事件关联函数【
 */
 	// 页面切换开始
 	page_start		: function(){
 		car2._page.on('touchstart mousedown',car2.page_touch_start);
 		car2._page.on('touchmove mousemove',car2.page_touch_move);
 		car2._page.on('touchend mouseup',car2.page_touch_end);
 	},

 	// 页面切换停止
 	page_stop		: function(){
		car2._page.off('touchstart mousedown');
 		car2._page.off('touchmove mousemove');
 		car2._page.off('touchend mouseup');
 	},

 	// page触摸移动start
 	page_touch_start: function(e){
 		if(!car2._moveStart) return;

 		if(e.type == "touchstart"){
        	car2._touchStartValY = window.event.touches[0].pageY;
        }else{
        	car2._touchStartValY = e.pageY||e.y;
        	car2._mouseDown = true;
        }

        car2._moveInit = true;

        // start事件
        car2._handleEvent('start');
 	},

 	// page触摸移动move
 	page_touch_move : function(e){
 		e.preventDefault();

		if(!car2._moveStart) return;
		if(!car2._moveInit) return;

		// 设置变量值
 		var $self = car2._page.eq(car2._pageNow),
 			h = parseInt($self.height()),
 			moveP,
 			scrollTop,
 			node=null,
 			move=false;

 		// 获取移动的值
 		if(e.type == "touchmove"){
        	moveP = window.event.touches[0].pageY;
        	move = true;
        }else{
        	if(car2._mouseDown){
        		moveP = e.pageY||e.y;
        		move = true;
        	}else return;
        }

		// 获取下次活动的page
        node = car2.page_position(e,moveP,$self);

		// page页面移动 		
 		car2.page_translate(node);

        // move事件
        car2._handleEvent('move');
 	},

 	// page触摸移动判断方向
 	page_position	: function(e,moveP,$self){ 		
 		var now,next;
	
 		// 设置移动的距离
 		if(moveP!='undefined') car2._touchDeltaY = moveP - car2._touchStartValY;

 		// 设置移动方向
    	car2._movePosition = moveP - car2._touchStartValY >0 ? 'down' : 'up';
    	if(car2._movePosition!=car2._movePosition_c){
    		car2._moveFirst = true;
    		car2._movePosition_c = car2._movePosition;
    	}else{
			car2._moveFirst = false;
    	}

		// 设置下一页面的显示和位置        
        if(car2._touchDeltaY<=0){
        	if($self.next('.m-page').length == 0){
        		car2._pageNext = 0;
        	} else {
        		car2._pageNext = car2._pageNow+1;	
        	}
 			
 			next = car2._page.eq(car2._pageNext)[0];
 		}else{
 			if($self.prev('.m-page').length == 0 ) {
 				if (car2._firstChange) {
 					car2._pageNext = car2._pageNum - 1;
 				} else {
 					return;
 				}
 			} else {
 				car2._pageNext = car2._pageNow-1;	
 			}
 			
 			next = car2._page.eq(car2._pageNext)[0];
 		}

 		now = car2._page.eq(car2._pageNow)[0];
 		node = [next,now];

 		// move阶段根据方向设置页面的初始化位置--执行一次
 		if(car2._moveFirst) init_next(node);

 		function init_next(node){
 			var s,l,_translateZ = car2._translateZ();

 			car2._page.removeClass('action');
 			$(node[1]).addClass('action').removeClass('f-hide');
 			car2._page.not('.action').addClass('f-hide');
 			
 			// 模版高度适配函数处理
	 		car2.height_auto(car2._page.eq(car2._pageNext),'false');

 			// 显示对应移动的page
			$(node[0]).removeClass('f-hide').addClass('active'); 

	 		// 设置下一页面的显示和位置        
	        if(car2._movePosition=='up'){
 				s = parseInt($(window).scrollTop());
 				if(s>0) l = $(window).height()+s;
 				else l = $(window).height();
 				node[0].style[car2._prefixStyle('transform')] = 'translate(0,'+l+'px)'+_translateZ;
 				$(node[0]).attr('data-translate',l);

 				$(node[1]).attr('data-translate',0);
	 		}else{
 				node[0].style[car2._prefixStyle('transform')] = 'translate(0,-'+Math.max($(window).height(),$(node[0]).height())+'px)'+_translateZ;
 				$(node[0]).attr('data-translate',-Math.max($(window).height(),$(node[0]).height()));

 				$(node[1]).attr('data-translate',0);
	 		}
 		}
 		
 		return node;
 	},

 	// page触摸移动设置函数
 	page_translate	: function(node){
 		// 没有传值返回
 		if(!node) return;
		
 		var _translateZ = car2._translateZ(),
 			y_1,y_2,scale,
 			y = car2._touchDeltaY;

 		// 切换的页面移动
 		if($(node[0]).attr('data-translate')) y_1 = y + parseInt($(node[0]).attr('data-translate'));
		node[0].style[car2._prefixStyle('transform')] = 'translate(0,'+y_1+'px)'+_translateZ;
		
		// 当前的页面移动
		if($(node[1]).attr('data-translate')) y_2 = y + parseInt($(node[1]).attr('data-translate'));
		scale = 1 - Math.abs(y*0.2/$(window).height());
		y_2 = y_2/5;
		node[1].style[car2._prefixStyle('transform')] = 'translate(0,'+y_2+'px)'+_translateZ+' scale('+scale+')';
 	},

 	// page触摸移动end
 	page_touch_end	: function(e){
 		car2._moveInit = false;
 		car2._mouseDown = false;
 		if(!car2._moveStart) return;
 		if(!car2._pageNext&&car2._pageNext!=0) return;

 		car2._moveStart = false;

 		// 确保移动了
 		if(Math.abs(car2._touchDeltaY)>10){
 			car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transition')] = 'all .3s';
 			car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transition')] = 'all .3s';
 		}
			
		// 页面切换
 		if(Math.abs(car2._touchDeltaY)>=100){		// 切换成功
 			car2.page_success();
 		}else if(Math.abs(car2._touchDeltaY)>10&&Math.abs(car2._touchDeltaY)<100){	// 切换失败		
 			car2.page_fial();
 		}else{									// 没有切换
 			car2.page_fial();
 		}

 		// end事件
        car2._handleEvent('end');

        // 注销控制值
 		car2._movePosition = null;
 		car2._movePosition_c = null;
 		car2._touchStartValY = 0;
 	},

 	// 切换成功
 	page_success	: function(){
 		var _translateZ = car2._translateZ();

 		// 下一个页面的移动
 		car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transform')] = 'translate(0,0)'+_translateZ;

 		// 当前页面变小的移动
 		var y = car2._touchDeltaY > 0 ? $(window).height()/5 : -$(window).height()/5;
 		var scale = 0.8;
 		car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transform')] = 'translate(0,'+y+'px)'+_translateZ+' scale('+scale+')';

 		// 成功事件
    	car2._handleEvent('success');
 	},

 	// 切换失败
 	page_fial	: function(){
 		var _translateZ = car2._translateZ();

 		// 判断是否移动了
		if(!car2._pageNext&&car2._pageNext!=0) {
			car2._moveStart = true;
			car2._moveFirst = true;
			return;
		}

 		if(car2._movePosition=='up'){
 			car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transform')] = 'translate(0,'+$(window).height()+'px)'+_translateZ;
 		}else{
 			car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transform')] = 'translate(0,-'+$(window).height()+'px)'+_translateZ;
 		}

 		car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transform')] = 'translate(0,0)'+_translateZ+' scale(1)';

 		// fial事件
    	car2._handleEvent('fial');
 	},

/**
 *  对象函数事件绑定处理
 *  -->start touch开始事件
 *  -->mov   move移动事件
 *  -->end   end结束事件
 */
 	haddle_envent_fn : function(){
 		// 当前页面移动，延迟加载以后的图片

		// 当前页面移动
		car2._on('move',function(){
			
		});

		// 切换失败事件
		car2._on('fial',function(){
			setTimeout(function(){
				car2._page.eq(car2._pageNow).attr('data-translate','');
 				car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transform')] = '';
 				car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transition')] = '';
 				car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transform')] = '';
	 			car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transition')] = '';

	 			car2._page.eq(car2._pageNext).removeClass('active').addClass('f-hide');
				car2._moveStart = true;
				car2._moveFirst = true;
				car2._pageNext = null;
				car2._touchDeltaY = 0;
				car2._page.eq(car2._pageNow).attr('style','');
	 		},300)
		})

		// 切换成功事件
		car2._on('success',function(){
			// 判断最后一页让，开启循环切换
			if (car2._pageNext == 0 && car2._pageNow == car2._pageNum -1) {
				car2._firstChange = true;
			}

			// 判断是否是最后一页，让轻APP关联页面隐藏
 			if(car2._page.eq(car2._pageNext).next('.m-page').length != 0){
 				car2.lightapp_intro_hide(true);
 			}
			setTimeout(function(){
				// 设置富文本的高度
				car2.Txt_init(car2._page.eq(car2._pageNow));

				// 判断是否为最后一页，显示或者隐藏箭头
				if(car2._pageNext == car2._pageNum-1 ) $('.u-arrow').addClass('f-hide');
				else  $('.u-arrow').removeClass('f-hide');

	 			car2._page.eq(car2._pageNow).addClass('f-hide');

				car2._page.eq(car2._pageNow).attr('data-translate','');
 				car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transform')] = '';
 				car2._page.eq(car2._pageNow)[0].style[car2._prefixStyle('transition')] = '';
 				car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transform')] = '';
	 			car2._page.eq(car2._pageNext)[0].style[car2._prefixStyle('transition')] = '';

	 			// 初始化切换的相关控制值
	 			$('.p-ct').removeClass('fixed');
	 			car2._page.eq(car2._pageNext).removeClass('active');
				car2._page.eq(car2._pageNext).removeClass('fixed');
				car2._pageNow = car2._pageNext;
				car2._moveStart = true;
				car2._moveFirst = true;
				car2._pageNext = null;
				car2._page.eq(car2._pageNow).attr('style','');
				car2._page.eq(car2._pageNow).removeClass('fixed');
				car2._page.eq(car2._pageNow).attr('data-translate','');
				car2._touchDeltaY = 0;

				// 切换成功后，执行当前页面的动画---延迟200ms
				setTimeout(function(){
					if(car2._page.eq(car2._pageNow).hasClass('z-animate')) return;
					car2._page.eq(car2._pageNow).addClass('z-animate');
				},20)

				// 隐藏图文组件的文本
				$('.j-detail').removeClass('z-show');
				$('.txt-arrow').removeClass('z-toggle');

				// 切换停止视频的播放
				$('video').each(function(){
					if(!this.paused) this.pause();
				})

				// 设置富文本的高度
				car2.Txt_init(car2._page.eq(car2._pageNow));

				// 判断是否滑动最后一页，并让轻APP介绍关联页面贤淑
	 			if(car2._page.eq(car2._pageNow).next('.m-page').length == 0){
	 				car2.lightapp_intro_show();
	 				car2.lightapp_intro();
	 			}
	 		},300)

			// 切换成功后，发送统计
			var laytouType = car2._page.eq(car2._pageNow).attr('data-statics');
			
			car2.ajaxTongji(laytouType);
		})
 	},

/**************************************************************************************************************/
/*  单个处理函数
***************************************************************************************************************/
/**
 * 单个函数处理-unit
 * -->高度的计算
 * -->文本的展开
 * -->文本的收起
 * -->输入表单的操作
 * -->微信的分享提示
 */
	// 根据设备的高度，来适配每一个模版的高度，并且静止滑动
	// --文档初始化计算
	// --页面切换完成计算
	height_auto	: function(ele,val){
		ele.children('.page-con').css('height','auto');
		var height = $(window).height();

		// 需要解除固定高度的page卡片
		var vial = true;
		if(!vial){
			if(ele.height()<=height){
				ele.children('.page-con').height(height+2);
				if((!$('.p-ct').hasClass('fixed'))&&val=='true') $('.p-ct').addClass('fixed');
			}else{
				car2._scrollStart();
				if(val=='true') $('.p-ct').removeClass('fixed');
				ele.children('.page-con').css('height','100%');
				return;
			}
		}else{
			ele.children('.page-con').height(height+2);
			if((!$('.p-ct').hasClass('fixed'))&&val=='true') $('.p-ct').addClass('fixed');
		}
	},

	// 富文本的设置
	Txt_init : function(node){
		if(node.find('.j-txt').length<=0) return;
		if(node.find('.j-txt').find('.j-detail p').length<=0) return;

		node.find('.j-txt').each(function(){
			var txt = $(this).find('.j-detail'),
				title = $(this).find('.j-title'),
				arrow = title.find('.txt-arrow'),
				p = txt.find('p'),
				height_t = parseInt(title.height()),
				height_p = parseInt(p.height()),
				height_a = height_p+height_t;

			if ($(this).parents('.m-page').hasClass('m-smallTxt')) {
				if ($(this).parents('.smallTxt-bd').index() == 0) {
					txt.css('top',height_t);
				} else {
					txt.css('bottom',height_t);
				}
			}

			txt.attr('data-height',height_p);
			$(this).attr('data-height-init',height_t);
			$(this).attr('data-height-extand',height_a);

			p[0].style[car2._prefixStyle('transform')] = 'translate(0,-'+height_p+'px)';
			if($(this.parentNode).hasClass('z-left')) p[0].style[car2._prefixStyle('transform')] = 'translate(0,'+height_p+'px)';

			txt.css('height','0');
			arrow.removeClass('z-toggle');
			$(this).css('height',height_t);
		})
	},

	// 富文本组件点击展开详细内容
	bigTxt_extand : function(){
		$('body').on('click','.j-title',function(){
			if($('.j-detail').length<=0) return;

			// 定位
			var detail = $(this.parentNode).find('.j-detail');
			$('.j-detail').removeClass('action');
			detail.addClass('action');
			if($(this).hasClass('smallTxt-arrow')){
				$('.smallTxt-bd').removeClass('action');
				detail.parent().addClass('action');
			}

			// 设置
			if(detail.hasClass('z-show')){
				detail.removeClass('z-show');
				detail.css('height',0);
				$(this.parentNode).css('height',parseInt($(this.parentNode).attr('data-height-init')));
			}
			else{
				detail.addClass('z-show');
				detail.css('height',parseInt(detail.attr('data-height')));
				$(this.parentNode).css('height',parseInt($(this.parentNode).attr('data-height-extand')));
			}

			$('.j-detail').not('.action').removeClass('z-show');
			$('.txt-arrow').removeClass('z-toggle');

			detail.hasClass('z-show') ? ($(this).find('.txt-arrow').addClass('z-toggle')) : ($(this).find('.txt-arrow').removeClass('z-toggle'))
		})
	}(),

	// 文本点击其他地方收起
	Txt_back : function(){
		$('body').on('click','.m-page',function(e){
			e.stopPropagation();

			// 判断
			var node = $(e.target);
			var page = node.parents('.m-page');
			var txtWrap = node.parents('.j-txtWrap').length==0 ? node : node.parents('.j-txtWrap');
			if(page.find('.j-txt').find('.j-detail p').length<=0) return;
			if(page.find('.j-txt').length<=0||node.parents('.j-txt').length>=1 || node.hasClass('bigTxt-btn') || node.parents('.bigTxt-btn').length>=1) return;

			// 定位
			var detail = txtWrap.find('.j-detail');
			$('.j-detail').removeClass('action');
			detail.addClass('action');
			$('.j-detail').not('.action').removeClass('z-show');

			// 设置
			txtWrap.each(function(){
				var detail = $(this).find('.j-detail');
				var arrow = $(this).find('.txt-arrow');
				var txt = $(this).find('.j-txt');

				if(detail.hasClass('z-show')){
					detail.removeClass('z-show');
					detail.css('height',0);
					txt.css('height',parseInt(txt.attr('data-height-init')));
				}else{
					detail.addClass('z-show');
					detail.css('height',parseInt(detail.attr('data-height')));
					txt.css('height',parseInt(txt.attr('data-height-extand')));
				}

				detail.hasClass('z-show') ? (arrow.addClass('z-toggle')) : (arrow.removeClass('z-toggle'));
			})
		})
	}(),

	// 表单显示，输入
	input_form : function(){
		$('body').on('click','.book-bd .bd-form .btn',function(){
			var type_show = $(this).attr("data-submit");
			if (type_show == 'true') {
				return;
			}

			var heigt = $(window).height();

			$(document.body).css('height',heigt);
			car2.page_stop();
			car2._scrollStart();
			// 设置层级关系-z-index
			car2._page.eq(car2._pageNow).css('z-index',15);

			$('.book-bg').removeClass('f-hide');
			$('.book-form').removeClass('f-hide');
			setTimeout(function(){
				$('.book-form').addClass('z-show');
				$('.book-bg').addClass('z-show');
			},50)

			$('.book-bg').off('click');
			$('.book-bg').on('click',function(e){
				e.stopPropagation();

				var node = $(e.target);

				if(node.parents('.book-form').length>=1 && !node.hasClass('j-close-img') && node.parents('.j-close').length<=0) return;

				$('.book-form').removeClass('z-show');
				$('.book-bg').removeClass('z-show');
				setTimeout(function(){
					$(document.body).css('height','100%');
					car2.page_start();
					car2._scrollStop();
					// 设置层级关系-z-index
					car2._page.eq(car2._pageNow).css('z-index',9);
					
					$('.book-bg').addClass('f-hide');
					$('.book-form').addClass('f-hide');
				},500)
			})
		})
	}(),

	sex_select : function(){
		var btn = $('#j-signUp').find('.sex p');
		var strongs = $('#j-signUp').find('.sex strong');
		var input = $('#j-signUp').find('.sex input');

		btn.on('click',function(){
			var strong = $(this).find('strong');
			strongs.removeClass('open');
			strong.addClass('open');

			var value = $(this).attr('data-sex');
			input.val(value);
		})
	}(),

	// 显示轻APP按钮
	lightapp_intro_show : function(){
		$('.market-notice').removeClass('f-hide');
		setTimeout(function(){
			$('.market-notice').addClass('show');
		},100)
	},

	// 隐藏轻APP按钮
	lightapp_intro_hide : function(val){
		if(val){
			$('.market-notice').addClass('f-hide').removeClass('show');
			return;
		} 

		$('.market-notice').removeClass('show');
		setTimeout(function(){
			$('.market-notice').addClass('f-hide')
		},500)
	},

	// 轻APP介绍弹窗关联
	lightapp_intro : function(){
		// 点击按钮显示内容
		$('.market-notice').off('click');
		$('.market-notice').on('click',function(){
			$('.market-page').removeClass('f-hide');
			setTimeout(function(){
				$('.market-page').addClass('show');
				setTimeout(function(){
					$('.market-img').addClass('show');
				},100)
				car2.lightapp_intro_hide();
			},100)

			// 禁止滑动
			car2.page_stop();
			car2._scrollStop();
		});

		// 点击窗口让内容隐藏
		$('.market-page').off('click');
		$('.market-page').on('click',function(e){
			if($(e.target).hasClass('market-page')){
				$('.market-img').removeClass('show');
				setTimeout(function(){
					$('.market-page').removeClass('show');
					setTimeout(function(){
						$('.market-page').addClass('f-hide');
					},200)
				},500)
				car2.lightapp_intro_show();

				// 禁止滑动
				car2.page_start();
				car2._scrollStart();
			}
		});
	},

	//统计函数处理
 	ajaxTongji	: function(laytouType){
		var channel_id = location.search.substr(location.search.indexOf("channel=") + 8);
		channel_id= channel_id.match(/^\d+/) ; 
		if (!channel_id || isNaN(channel_id) || channel_id<0) {
		channel_id = 1;
	}
 	 	var activity_id = $('#activity_id').val();
 	 	var url = "/analyseplugin/plugin?activity_id="+activity_id + "&plugtype="+laytouType;
		 //报名统计请求
	 	$.get(url,{},function(){});
 	},

 	// 微信的分享提示
 	wxShare : function(){
 		$('body').on('click','.bigTxt-btn-wx',function(){
 			var img_wx = $(this).parent().find('.bigTxt-weixin');
 			
 			img_wx.addClass('z-show');
 			car2.page_stop();

 			img_wx.on('click',function(){
 				$(this).removeClass('z-show');
 				car2.page_start();

 				$(this).off('click');
 			})
 		})
 	}(),


/**
 * app初始化
 */
	// 样式适配
	styleInit : function(){
		// 禁止文版被拖动
		document.body.style.userSelect = 'none';
		document.body.style.mozUserSelect = 'none';
		document.body.style.webkitUserSelect = 'none';

		// 判断设备的类型并加上class
		if(car2._IsPC()) $(document.body).addClass('pc');
		else $(document.body).addClass('mobile');
		if(car2._Android) $(document.body).addClass('android');
		if(car2._iPhoen) $(document.body).addClass('iphone');

		// 判断是否有3d
		if(!car2._hasPerspective()){
			car2._rotateNode.addClass('transformNode-2d');
			$(document.body).addClass('no-3d');
		}
		else{
			car2._rotateNode.addClass('transformNode-3d');
			$(document.body).addClass('perspective');
			$(document.body).addClass('yes-3d');
		}

		// 设置富文本的高度
		car2.Txt_init(car2._page.eq(car2._pageNow));
		
		// 模版提示文字显示
		setTimeout(function(){
			$('.m-alert').find('strong').addClass('z-show');
		},1000)

		$('.u-arrow').on('touchmove',function(e){e.preventDefault()})

		$('.p-ct').height($(window).height());
		$('.m-page').height($(window).height());
		$('#j-mengban').height($(window).height());
		$('.translate-back').height($(window).height());
	},

	// 对象初始化
	init : function(){
		// 样式，标签的渲染
		// 对象操作事件处理
		this.styleInit();
		this.haddle_envent_fn();

		
		$('input[type="hidden"]').appendTo($('body'));


		// loading执行一次
		var loading_time = new Date().getTime();
		
		$(window).on('load',function(){
			var now = new Date().getTime();
			var loading_end = false;
			var time;
			var time_del = now - loading_time;

			if ( time_del >= 2200 ) {
				loading_end = true;
			}

			if ( loading_end ) {
				time = 0;
			} else {
				time = 2200 - time_del;
			}

			// loading完成后请求
			setTimeout(function(){

				// 模版提示隐藏
				setTimeout(function(){
					$('.m-alert').addClass('f-hide');
				},1000)

				// 显示正面
				$('#j-mengban').addClass('z-show');

				// 显示封面内容
				setTimeout(function(){
					$('.translate-back').removeClass('f-hide');
					$('.m-fengye').removeClass('f-hide');
					car2.height_auto(car2._page.eq(car2._pageNow),'false');
				},1000)


			 	$('.p-ct').height($(window).height());
				$('.m-page').height($(window).height());
				$('#j-mengban').height($(window).height());
				$('.translate-back').height($(window).height());
			},time)
		})
	}
};
//
///*初始化对象函数*/
//car2.init();