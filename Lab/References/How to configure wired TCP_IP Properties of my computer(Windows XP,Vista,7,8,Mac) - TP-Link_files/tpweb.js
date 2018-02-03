/*
// Author: PATRICK.CHEN@TP-LINK.COM
// Created date: 2013-12-11
// Last modified: 2016-03-09
*/
function isUndefined(varNameString, _this) {
	var w = arguments.length > 1 ? arguments[1] : window;
	return /^undefined|unknown$/i.test(typeof(w[varNameString])); 
}
if (isUndefined('tpWeb') || typeof(tpWeb) != 'object') tpWeb = {};
tpWeb.site = (function (o) { if (typeof(o) == 'object' && o != null) return o; return null; })(/*{siteInfo}*/);
tpWeb.browser = (function () {
	var o = {};
	o.msie = (function (m) {
		var rtv = false;
		if (m != null) {
			rtv = true;
			if (m.length > 1) {
				var v = parseFloat(m[1]);
				if (!isNaN(v)) rtv = { version: v };
			}
		}
		return rtv;
	})(navigator.userAgent.toString().match(/\bMSIE(?: (\d)(?:\.\d+)?)?/i));
	o.msie6_lte = (function (ie) { if (ie && ie.version && ie.version < 7) { return true; } return false; })(o.msie);
	o.lteIE8 = (function (ie) { if (ie && ie.version && ie.version <= 8) { return true; } return false; })(o.msie);
	return o;
})();
tpWeb.size = {};
tpWeb.size.min = { width:960 };
tpWeb.size.max = { width:1200 };
tpWeb.pageSize = { maxWidth: 1200, minWidth: 960 };
tpWeb.fn = (function () {
    var getArray = function (a) {
        var b = [];
        if (a && a.length > 0) { for (var i = 0; i < a.length; i++) { b.push(a[i]); } }
        return b;
    };
	var o = {};
	o.getStyle = function (elmt, attrName) {//获取页面元素最终的合成样式
		var attrName = arguments.length > 1 && typeof(arguments[1]) == 'string' ? arguments[1] : null;
		if (attrName != null) attrName = attrName.replace(/\-[a-z]/, function (m) { return m.substring(1).toUpperCase(); });
		if (attrName == null) {
			return window.getComputedStyle 
				? window.getComputedStyle(elmt, null)
				: elmt.currentStyle;
		} else {
			return window.getComputedStyle 
				? window.getComputedStyle(elmt, null)[attrName] 
				: elmt.currentStyle[attrName];
		}
	};
	o.getMaxZIndex = function () {//获取页面最大z-index值
		var arg = arguments.length > 0 ? arguments[0] : null;
		var $elms = (arg instanceof jQuery) ? arg : $('body *');
		return Math.max.apply(null, $.map($elms, function (e) {
			var style = o.getStyle(e);
			if (style != null && /^(?:absolute|relative|fixed)$/.test(style['position'])) {
				return parseInt(style['z-index']) || parseInt(style['zIndex']) || 1;
			}
		}));
	};
	o.getScaledSize = function (aOrigSize, aMaxSize) {//限制大小，超出范围则等比缩小
		var a = aOrigSize; 
		if (a[0] > aMaxSize[0] || a[1] > aMaxSize[1]) 
		{
			var r = a[0] / a[1];
			if (r > aMaxSize[0] / aMaxSize[1]) {
				a[0] = aMaxSize[0];
				a[1] = a[0] / r;
			} else {
				a[1] = aMaxSize[1];
				a[0] = r * a[1];
			}
		}
		return a;
	};
	o.getBodyScrollTop = function() {//获取页面顶部卷去的高度，如含一个bool类型的参数且值为true，则不包含当前页面的可见区域高，默认包含当前页面的可见区域高
		var excludeClientHeight = (arguments != null && arguments.length > 0 && typeof(arguments[0]) == 'boolean') ? arguments[0] : false;
		var bdy = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;
		var scrollTop = (bdy.scrollTop == 0) ? document.body.scrollTop : bdy.scrollTop;
		return scrollTop + ((excludeClientHeight) ? 0 : bdy.clientHeight);
	};
	o.getOffsetTop = function(elm) { //获取元素在当前页面的坐标值(y)
		var t = 0;
		var height = arguments.length > 1 ? parseInt(arguments[1]) : 0;
		if (isNaN(height)) height = 0;
		while (elm && elm.offsetParent) {
			t += elm.offsetTop;
			elm = elm.offsetParent;
		}
		return t + height;
	};
    o.loadFile = function (aSrc, tagName, oOtherAttributes, callback) {
        var args = getArray(arguments);
        var aSrc = args.shift();
        var tagName = args.shift();
        var oAttributes = args.shift();
        var callback = function () {};
		if (args.length > 0) callback = args.shift();
		var doc = document;
        var elm = doc.createElement(tagName);
        for (var key in oAttributes) {
            elm.setAttribute(key, oAttributes[key]);
        }
        if (elm.readyState) {
            elm.onreadystatechange = function () {
                if (elm.readyState == "loaded" || elm.readyState == "complete") {
                    elm.onreadystatechange = null;
                    callback.apply(this, args);
                }
            }
        } else {
            if (!(tagName.toLowerCase() == 'link' && (function (src, ua, _this) {//Hack for Safari 6-
                if (window.openDatabase && ua.indexOf("safari") > -1 && ua.indexOf("chrome") == -1) {
                    if (parseFloat(ua.match(/version\/([\d.]+)/)[1]) < 6) {
                        var timeout = 60000, elapsedTime = 0, intervalTime = 50;
                        var styleSheets = document.styleSheets;
                        var curCSSNum = styleSheets.length;
                        var whref = location.href.split('?')[0];
                        var href = (function (href, pathname) { 
                            return (src.indexOf('://') != -1 ? src : ((src.indexOf('/') == 0 
                                ? href.substring(0, href.length - pathname.length) 
                                : href.substring(0, href.lastIndexOf('/') + 1)) + src)).toLowerCase();
                        })(location.href, location.pathname);
                        var timer = setInterval(function(){
                            if(styleSheets.length > curCSSNum){
                                for (var i = 0; i < styleSheets.length; i++) {
                                    if (styleSheets[i].href.toLowerCase() == href) {
                                        clearInterval(timer);
                                        callback.apply(_this, args);
                                        return;
                                    }
                                }
                                curCSSNum = styleSheets.length;
                                elapsedTime += intervalTime;
                                if (elaspedTime > timeout) clearInterval(timer);
                            }
                        }, intervalTime);
                        return true;
                    }
                }
                return false;
            })(aSrc[1], navigator.userAgent.toLowerCase(), this))) {
                if (elm.addEventListener) { elm.addEventListener('load', function(){ callback.apply(this, args); }, false); } 
                else elm.onload = function () { callback.apply(this, args);};
            }
        }
        elm.setAttribute(aSrc[0], aSrc[1]);
		var heads = doc.getElementsByTagName("head");
		if(heads.length) heads[0].appendChild(elm);
		else doc.documentElement.appendChild(elm);
    };
    o.loadScript = function (jsSrc, callback) {
        var a = getArray(arguments);
        var src = a.shift();
        a.splice(0, 0, ['src', src], 'script', { 'type': 'text/javascript' });
        o.loadFile.apply(this, a);
    };
    o.loadStyle = function (href, callback) {
        var a = getArray(arguments);
        var href = a.shift();
        a.splice(0, 0, ['href', href], 'link', { 'type': 'text/css', 'rel': 'stylesheet' });
        o.loadFile.apply(this, a);
    }
	o.loadIframe = function (src, oninit, onload) {
		var args = getArray(arguments);
		var src = args.shift();
        var oninit = function () {};
		if (args.length > 0) oninit = args.shift();
        var callback = function () {};
		if (args.length > 0) callback = args.shift();
		var iframe = $('<iframe src="javascript:;" frameborder="0" allowtransparency="true" allowfullscreen style="width:100%;height:100%;"></iframe>')[0];
		args.unshift(iframe);
		if (iframe.readyState) {
			iframe.onreadystatechange = function () {
				if (iframe.readyState == "loaded" || iframe.readyState == "complete") { 
					iframe.onreadystatechange = null; 
					onload.apply(this, args);
				}
			}
		} else { iframe.onload = function () { onload.apply(this, args); } }
		$(iframe).attr('src', src);
		oninit.apply(this, args);
		return $(iframe);
	};
	o.loadVideoIframe = function (src, oninit, onload) {
		if (/(www\.)?youtube\.com\b/i.test(src)) {
			var v = (function (m) { if (!!m) return m[1]; })(src.match(/\bv\=([^&]+)/));
			if (!!v && v != '') {//src = 'https://youtube.googleapis.com/v/' + v + '?wmode=opaque';
				src = '//www.youtube.com/embed/'+ v + '?autoplay=0&autohide=1&fs=1&rel=0&hd=1&wmode=opaque&enablejsapi=1'; 
			}
		}
		return o.loadIframe(src, oninit, onload);
	};
	o.addStyle = function (cssString) {
		var doc = document;
		var style = doc.createElement("style");
		style.setAttribute("type", "text/css");
		if (style.styleSheet) {//IE
			style.styleSheet.cssText = cssString;
		} else {//w3c
			var cssText = doc.createTextNode(cssString);
			style.appendChild(cssText);
		}
		var heads = doc.getElementsByTagName("head");
		if (heads.length) heads[0].appendChild(style);
		else doc.documentElement.appendChild(style);
	};
	o.getViewportSize = function () {//获取浏览器的可见区域大小
		var a = [], isStrict = document.compatMode == "CSS1Compat";
		a[0] = window.innerWidth ? window.innerWidth 
			: ((isStrict) ? document.documentElement.clientWidth : document.body.clientWidth);
		a[1] = window.innerHeight ? window.innerHeight 
			: ((isStrict) ? document.documentElement.clientHeight : document.body.clientHeight);
		return a;
	};
	o.htmlEncode = function (str) {  
		var div = document.createElement('div');  
		div.appendChild(document.createTextNode(str));  
		return div.innerHTML;  
	};  
	o.htmlDecode = function (str) {  
		var div = document.createElement('div');  
		div.innerHTML = str;  
		return div.innerText || div.textContent;  
	};
	return o;
})();
tpWeb.slider = (function () {
    var o = {};
    o.init=function(sliderClass){
	  tpWeb.fn.loadScript('/res/js/cxtutils/jquery.bxslider.js?v=20160705', function () {
		tpWeb.fn.loadStyle('/res/style/css/jquery.bxslider.css',function(){
			var width=$(window).width();
			var _mode=width<=736?"horizontal":"fade";//判断pc和mobile的展示方式
			var _controls=width<=736?false:true;
		    $("."+sliderClass).bxSlider({mode:_mode,speed:1000,controls:_controls});
		})
	  });
	};
	o.productSlider=function(sliderClass){
	  var $box=$("."+sliderClass).find(".default-content-box");
	  var dataW736=$box.attr("data-w736"),dataW1920=$box.attr("data-w1920");
	  var addImg="<img />";
	  var flag=false;
	  var helper=function(data){
		if(flag)return;
		if($box.find(".page-description").length==1){
	      $box.removeAttr("style").find(".page-description").prepend($(addImg).attr("src",data).css({width:"100%",height:"auto","vertical-align":"top"}));
		}else{
		  $box.append(($(addImg).attr("src",data).css({width:"100%",height:"auto","vertical-align":"top"})));
		}
		flag=true;
	  };
	  $(window).resize(function(){
	    if(tpWeb.fn.getViewportSize()[0]<=736){
		  var img=new Image();
	      img.onload=function(){helper(img.src);};
		  img.onerror=function(){helper(img.src);};
		  img.src=(dataW736!="")?dataW736:dataW1920;
		}else{
		  $box.css("background-image","url("+dataW1920+")");
		  if(!flag)return;
		  $box.find("img").remove();
		  flag=false;
		}
	  }).resize();
	}
    return o;
})();
tpWeb.siteNav = function () {
	var option = {
		headerId: 'headerContainer',
		subNavId: 'subNavContainer',
		beforeInit: null,
		afterInit: null,
		initSubNavBox: null
	};
	if (!isUndefined('siteNavOption', tpWeb)) {
		for (var name in tpWeb.siteNavOption) {
			option[name] = tpWeb.siteNavOption[name];
		}
	}
	var getClassName = function (dataID) { return (dataID != '' && /^\d/.test(dataID) ? 'cat_' : '') + dataID; };
	return (function ($header, $subNav) {
		var oSiteNav = {};
		oSiteNav.init = function () {
			if ($header.length == 0) return;
			var moreClassName = 'icon-down-drop-2';
			var activeClassName = 'active';
			var $bg = $('<b class="bg"></b>').appendTo($subNav.addClass('no-bg'));
			$subNav.css('top', $header.height() + 'px');
			$liMainNavs = (function ($uls) {
				if ($uls.length == 0) return;
				$uls.children('li').each(function () {
					var $li = $(this);
					var $a = $li.children('a');
					var $sub = $li.children('.sub-nav');
					var helper = (function (attrName) {
						var o = {};
						o.dataIDName = 'data-id';
						o.dataTimeoutIdName = attrName;
						o.set = function (value) {$subNav.attr(attrName, value); };
						o.get = function () { return $subNav.attr(attrName); };
						o.getTimeoutId = function () {
							var id = o.get();
							if (id) id = parseInt(id);
							if (isNaN(id)) id = null;
							return id;
						};
						o.remove = function () { $subNav.removeAttr(attrName); };
						o.setTimeout = function ($a) {
							o.set(setTimeout(function () {
								if (!$subNav.attr(attrName)) return;
								$subNav.hide().children().not($bg).hide();
								$a.parent().parent().children('li').children('a').removeClass(activeClassName);
								o.remove();
							}, 10));
						};
						o.clearTimeout = function () {
							var id = o.getTimeoutId();
							if (id != null) clearTimeout(id);
							o.remove();
						};
						o.isChild = function (elm) {
							var parent = elm;
							var flag = false;
							while (parent != null) {
								if (parent === $subNav[0] || parent === $li[0]) {
									flag = true;
									break;
								}
								parent = parent.parentNode;
							}
							return flag;
						};
						return o;
					})('data-timeoutId');
					
					if ($sub.length > 0 && $sub.children('li,dl').length > 0) {
						$a.addClass(moreClassName).mouseover(function () {
							var $a = $(this);
							var $li = $a.parent();
							var dataID = $li.attr(helper.dataIDName);
							var $box = $();
							
							if (dataID && dataID != '') $box = $subNav.children('.' + getClassName(dataID));
							$subNav.css('z-index', 1);
							var maxZIndex = tpWeb.fn.getMaxZIndex();
							var attrName = helper.dataTimeoutIdName;
							
							$subNav.css('z-index', maxZIndex + 1)
							.add($li)
							.mouseover(function () {
								helper.clearTimeout();
							}).bind('mouseout', function (evt) {
								var elm = evt.relatedTarget;
								var flag = helper.isChild(elm);
								if (!flag) helper.setTimeout($a);
							});
							
							var $children = $subNav.children('div');
							$children.hide();
							$subNav.hide();
							$li.parent().children('li').children('a').not($a).removeClass(activeClassName);
							
							$subNav.show();
							$box.show();
							$a.addClass(activeClassName);
							
							if ($box.length == 0) initSubNavBox(dataID, $li.children('.sub-nav').remove(), $a);
							else positionPointer($box.children('.pointer'), $a);
							
							return false;
						});
					}
				});
			})($header.find('.nav>ul'));
		};
		if (typeof(option.afterInit) == 'function') option.afterInit(option);
		
		function positionPointer($pointer, $a) {
			$pointer.css({ left:(getOffsetLeft($a.get(0)) + ($a.width() - $pointer.width()) / 2) + 'px'});
		}
		
		function getOffsetLeft(o) {
			var containerId = 'mainBox';
			var v = o.offsetLeft;
			o = o.offsetParent;
			while (o && o.id != containerId) {
				v += o.offsetLeft;
				o = o.offsetParent;
			}
			return v;
		}
		
		function initSubNavBox(dataID, $box) {
			if (typeof(option.initSubNavBox) == 'function') { option.initSubNavBox(option, dataID, $box); return; }
			if (typeof(dataID) != 'string' || (typeof(dataID) == 'string' && dataID == '')) return;
			
			var colCount = 1, rowCount = 1, $items = $box.children('li'), t = -1, row = '<ul class="row"></ul>', $lis = $(), $row, count = 0;
			var strSubNavTemplate='<div class="container"><span class="pointer"></span><div class="sub-nav clearfix"> </div></div>';
			var $container = $(strSubNavTemplate).addClass(getClassName(dataID));
			var $subNavBox = $container.children('.sub-nav');
			var pageContainerClassName = 'page-container';
			var $content = $('<div class="' + pageContainerClassName + '"></div>').appendTo($subNavBox);
			
			switch (dataID) {
				case 'for-home':
					t = 0;
					colCount = 8;
					rowCount = 1;
					break;
				case 'for-business':
					t = 0;
					colCount = 5;
					rowCount = 1;
					break;
				case 'for-service-provider':
					t = 0;
					colCount = 7;
					rowCount = 1;
					break;
				case 'support':
					colCount = 3;
					rowCount = 1;
					break;
				case 'partners':
					colCount = 2;
					rowCount = 1;
					break;
				default:
					break;
			}
			
			(function (rowColCount) {
				if (t == 1) return;
				$items.each(function (i, e) {
					if (i % colCount == 0) 
					{
						if (count > 0 && count % rowCount == 0) {
							$content = $content.clone().html('').appendTo($subNavBox).addClass('page-hidden');
						}
						$row = $(row).appendTo($content);
						count++;
						rowColCount = 0;
					}
					$row.append($(this).addClass('col')).append("&nbsp;");
					rowColCount++;
				});
				if (t == 2 || $row.parent().children().length <= 1) return;
				while (colCount - rowColCount > 0) {
					$row.append($('<li></li>').addClass('col'));
					rowColCount++;
				}
			})(0);
			
			$container.appendTo($subNav).show();
			if (arguments.length > 2) positionPointer($container.children('.pointer'), arguments[2]);
			
			if (t == 0) {
				(function ($dts) {
					var maxHeight = 0; 
					$dts.each(function () {
						maxHeight = Math.max(maxHeight, $(this).height());
					}).height(maxHeight);
				})($container.find('dt'));
				
				$container.find('dd a').bind('mouseover', function (evt) {
					var a = evt.target;
					if (a.tagName && a.tagName == 'A') {
						var $li = $(a.parentNode);
						var $b = $li.children('.folder');
						var $ul = $li.children('ul');
						var $col = (function () {
							var $parent = $ul.parent();
							while ($parent.length > 0) {
								if ($parent.hasClass('col')) { return $parent; }
								$parent = $parent.parent();
							}
							return null;
						})();
						var isChild = function (elm) {
							var parent = elm;
							var flag = false;
							while (parent != null) {
								if (parent === $col[0]) {
									flag = true;
									break;
								}
								parent = parent.parentNode;
							}
							return flag;
						};
						if ($b.length > 0) {
							if ($b.text() == '+') {
								$ul.show();
								$b.text('-');
								$col.bind('mouseout', function (evt) {
									var e = evt.relatedTarget;
									var flag = isChild(e);
									if (!flag) {
										$ul.hide();
										$b.text('+');
										$col.unbind('mouseout');
									}
								});
							}
							evt.preventDefault();
						}
					}
				});
			}
			
			var $uls = $subNavBox.children('div').children('ul');
			if (t == 0 || t == 1) {
				ajustBox($uls, t == 1);
				initPrevNextButton($subNavBox, pageContainerClassName);
				
				if (tpWeb.browser.lteIE8) {
					var lastChildClassName = 'last-child';
					$uls.each(function (index, elem) {
						var $ul = $(this);
						$ul.children('li:last').addClass(lastChildClassName);
					});
					$subNavBox.children('div').each(function () {
						$(this).children('ul:last').addClass(lastChildClassName);
					});
				}
			} else {
				(function ($lis, width, containerWidth, left) {
					$lis.each(function () { width += $(this).outerWidth(true) + 1; });
					var left = left - width / 2;
					if (left + width > containerWidth) left = containerWidth - width;
					if (left < 0) left = 0;
					$uls.width(width).css({ left: left / containerWidth * 100 + '%' });
				})($uls.children('li'), 0, $container.width(), parseInt($container.children('.pointer').css('left')));
			}
		}
		
		function ajustBox($uls, isBiz) {
			var aMaxSize = [85, 100];
			var helper = (function (attrName) {
				var o = {};
				o.set = function ($ul, value) { $ul.attr(attrName, value); };
				o.get = function ($ul) { return $ul.attr(attrName); };
				o.getCount = function ($ul) {
					var i = o.get($ul);
					if (i != null) i = parseInt(i);
					if (isNaN(i)) i = null;
					return i;
				};
				o.getResizedSize = function (a) {
					return tpWeb.fn.getScaledSize(a, aMaxSize);
				};
				return o;
			})('data-count');
			$uls.each(function () {
				var $row = $(this);
				var $cols = $row.children('.col');
				$cols.each(function () {
					var $col = $(this);
					(function () {
						if (!isBiz) return;
						var width = $col.width();
						var $dl = $col.children('dl');
						$dl.css({ 'padding-left': 0, 'padding-right': 0 }).css('left', (((width - $dl.width()) / 2) / width * 100) + '%');
					})();
					var $img = $col.find('img');
					if($img.length==0)return;
					var $span = $img.parent();
					var img = new Image();
					var handler = function () {
						if (!($cols && $cols.length && $cols.length > 0)) return;
						var maxSpanHeight = 90;
						$cols.css('height', 'auto');
						if (!isBiz) { 
							$cols.find('div>a>span').css('height', 'auto').each(function () {
								var $span = $(this);
								$span.children('img').css('position', 'static');
								maxSpanHeight = Math.max(maxSpanHeight, $span.height());
							}).height(maxSpanHeight).children('img').each(function () {
								var $img = $(this);
								$img.css({ 'position': 'relative', 'top': ($img.parent().height() - $img.height()) + 'px' });
							});
						} 
						//$cols.height($row.height());
					};
					img.onload = function () { handler(); };
					img.onerror = function () { handler(); };
					img.src = $img.attr('src');
				});
			});
		}
		
		function initPrevNextButton($container, pageContainerClassName) {
			var className = pageContainerClassName;
			var $divs = $container.children('div');
			if ($divs.length < 2) return;
			var colWidth = $container.width();
			var $prev = $('<a href="javascript:;" class="page-nav prev">&lt;</a>').appendTo($container).click(function () {
				showNext(getVisible(), true);
			});
			var $next = $('<a href="javascript:;" class="page-nav next">&gt;</a>').appendTo($container).click(function () {
				showNext(getVisible(), false);
			});
			$next.show();
			function getVisible() {
				var $div = $divs.eq(0);
				$divs.each(function () {
					if (this.style.visibility != 'hidden') {
						$div = $(this);
						return false;
					}
				});
				return $div;
			}
			function showNext($current, isPrev) {
				var $div = $();
				if (isPrev) $div = $current.prev('div'); 
				else $div = $current.next('div');
				if ($div.length > 0) {
					$div.css('visibility', 'visible');
					$current.css('visibility', 'hidden');
					if ($div[0] === $divs[0]) {
						$prev.hide();
						$next.show();
					} else if ($div[0] === $divs[$divs.length - 1]) {
						$next.hide();
						$prev.show();
					}
				} else {
					if (isPrev) $prev.hide();
					else $next.hide();
				}
			}
		}
		return oSiteNav;
	})($('#' + option.headerId), $('#' + option.subNavId));
};
tpWeb.layoutHelper = (function () {
	var o = {};
	o.setColHeight = function ($rows, hasImg) {
		var hasImg = arguments.length > 1 && typeof(arguments[1]) == 'boolean' ? arguments[1] : false;
		$rows.each(function () {
			var $row = $(this);
			var $cols = $row.children('.col');
			var $imgs = $row.find('img');
			if ($imgs.length > 0) {
				$imgs.each(function () {
					var img = new Image();
					var handler = function () { $cols.css('height', 'auto').height($row.height()); };
					img.onload = function () { handler(); };
					img.onerror = function () { handler(); };
					img.src = this.src;
				});
			} else { $cols.height($row.height()); }
		});
	};
	o.initDropDownBox = function ($box) {
		if ($box.length == 0) return;
		var value = arguments.length > 1 ? arguments[1] : null;
		if (value == null) value = '';
		var $ul = $box.children('dd').children('ul');
		$box.css('z-index', tpWeb.fn.getMaxZIndex()).bind('mouseout', function (evt) {
			if (!(function (elmContainer, elm) {
				var parent = elm;
				var flag = false;
				while (parent != null) {
					if (parent === elmContainer) {
						flag = true;
						break;
					}
					parent = parent.parentNode;
				}
				return flag;
			})($box[0], evt.relatedTarget)) $ul.hide();
		});
		var $p = $box.children('dd').children('p').click(function () {
			var display = $ul.css('display');
			if (display != 'block') $ul.show();
			else $ul.hide();
		}).children('span').html((function ($lis) {
			var flag = false;
			var v = '';
			$lis.each(function(index, element) {
                if ($(this).attr('data-value') == value) {
					flag = true;
					v = $(this).text();
					return false;
				}
            });
			return flag ? v : '--';
		})($ul.children('li')));
	};
	return o;
})();
tpWeb.home = (function () {
	var o = {};
	o.init = function ($items, $cols) {
		if ($items.length == 0) {
			tpWeb.products.playVideo($cols.find('a.video'));
			return;
		}
		$cols.each(function (i, e) {
            var $col = $(this);
            var $a = $col.children('a');
            if ($a.hasClass('video')) tpWeb.products.playVideo($a);
			if (i + 1 <= $items.length) {
                var $item = $items.eq(i);
                var $itemA = $item.find('a');
                if ($itemA.text() != '') {
                    $item.find('a').append('<img src="/res/style/images/sp-arrow.gif" />');
				    $col.append($item.html());
                }
			}
		}).hover(function () {
            var $span = $(this).children('span');
            $span.stop().css({'bottom': '-' + $span.height() + 'px', 'visibility': 'visible'}).animate({'bottom': 0});
		}, function () {
            var $span = $(this).children('span');
            $span.stop().animate({'bottom': '-' + $span.height() + 'px'}, { callback: function () { $span.css('visibility', 'hidden'); }});
		});
	};
	return o;
})();
tpWeb.press = (function () {
	var o = {};
	o.initYearNav = function ($selector, name) {
		 $selector.on('click', function () {
			$(this).toggleClass('open');
			}).on('mouseleave', function () {
				$(this).removeClass('open');
			}).find('.option').on('click', function () {
				$(this).parent().prevAll('.text').text($(this).text());
		});
	};
	o.initAwards = function ($li) {
		var setColHeight=function(){
		    var maxH = 0;
            $li.css('height', 'auto').each(function () {
                maxH = Math.max(maxH, $(this).height());
            }).height(maxH);
		};
		setColHeight();
		$(window).resize(function(){setColHeight();});
	};
	return o;
})();
tpWeb.products = (function () {
    var o = {};
    o.initSiteTopNav = function (selector, target, productInfoNavClassName) {
        var fixedClassName = 'fixed';
        var activeClassName = 'active';
        var $container = $('<div class="site-top-nav-box"></div>').prependTo(target).css('zIndex', tpWeb.fn.getMaxZIndex() + 1);
        var $boxes = $('.product-info-nav');
        $(selector).appendTo($container);
        var navHeight = $container.height();
        $container.find('input[name="q"]').blur();

        var $divs = $('div.' + productInfoNavClassName);
        if ($divs.length == 0) return;
        var $top = $('<b class="scroll-to-top"> </b>')
			.appendTo($container)
			.click(function () {
			    $('html,body').animate({ scrollTop: '0px' }, 'fast');
			    window.location.hash = '';
			    $(this).hide();
			});

        var height = $divs[0].clientHeight;
        var divHeight = 0;
        var hash = window.location.hash;
        var helper = function () { };

        var $divInfos = $('body>div.page-content-wrapper>div.product-info').children('div').each(function (index, element) {
            var $div = $(this);
            if ($div.hasClass('related-products')) return;
            $div.children('.h2-box').hide();
        }).add($('body>div.page-content-wrapper>div.product-info-basic'));
        //var $padding = $('<div class="top-nav-place-holder" style="height:85px;"></div>').prependTo($divInfos.parent());
        var $defaultA = null;
        var $as = $divs.find("ul").find('a').click(function () {
            if ($(this).hasClass('support')) return true;
            var href = this.getAttribute('href');
            setActive(href);

            if ((function (hashName) {
                if (!(function (a) { return (a.length > 1 && a[1].toLowerCase() == hashName); })(href.split('#'))) return false;

                var $div = $(getDiv(href));
                var $container = $div.children('div.container');
                var $lis = $container.find('dd>ul>li');
                if ($lis.not($container.find('li.not-clear')).length <= 1) { window.location.href = $lis.children('a').attr('href'); return true; }

                tpWeb.fn.loadScript('/res/js/cxtutils/lightbox.js', function () {
                    var lightboxId = 'lightbox_' + hashName;
                    cxtUtils.lightbox.show(
						'<div class="utils clearfix">'
						+ '	<a href="javascript:;" class="close">Close</a> '
						+ '</div>'
						+ '<div class="content">'
						+ '	<div class="inner-box">' + $container.html() + '</div>'
						+ '</div>',
						lightboxId,
						'lightbox-gallery hardware-version',
						'auto'
					);
                    var $lightbox = $('#' + lightboxId);
                    $lightbox.find('a.close').click(function () { $lightbox.remove(); });
                });

                return true;
            })('support')) return false;

            $divInfos.hide();
            getPart(href).show();

            var div = getDiv(href);
            if (div) $(document).scrollTop(getOffsetTop(div));
        }).each(function () {
            if (this.getAttribute('href') == hash) {
                $defaultA = $(this);
                return false;
            }
        });

        if ($defaultA == null) $defaultA = $as.eq(0);

        var $header = $container.children().eq(0);
		
        var oInfo = {
            hContainer: $container.height(),
            hHeader: $header.height(),
            down: 'scroll-down',
            up: 'scroll-up'
        };
		
        $boxes.find("dl").find("a").eq(1).click(function () {//点击产品型号回到顶部
            $("html,body").animate({ scrollTop: 0 }, 100)
        });
        var _scrollTop = tpWeb.fn.getBodyScrollTop(true);
		var boxesTop=$boxes.offset().top;
        $(window).scroll(function () {
            var top = tpWeb.fn.getBodyScrollTop(true);
			
            (function (st, completeFlag) {
                _scrollTop = top;
				if(boxesTop<=top){
				  if($boxes.hasClass(completeFlag))return;
				  $boxes.addClass(completeFlag).addClass(fixedClassName);
				  //$padding.show();
				}else{
				  if(!$boxes.hasClass(completeFlag))return;
				  $boxes.removeClass(completeFlag).removeClass(fixedClassName);
				  //$padding.hide();
				}
            })(_scrollTop, 'fixed-complete');

            (function (st) {
                return;
                _scrollTop = top;
                var t = parseInt($container.css('top'));
                if (top - oInfo.hPadding <= 0) {
                    $container.unbind('animate').removeClass(oInfo.down).removeClass(oInfo.up).css('top', 0);
                } else if (top - oInfo.hPadding > 0 && top - st > 0) {//scroll-down
                    if (!isNaN(t) && Math.abs(t) == oInfo.hContainer) return;
                    if ($container.is(':animated')) {
                        if ($container.hasClass(oInfo.down)) return;
                        $container.removeClass(oInfo.up).unbind('animate');
                    }
                    $container.removeClass(oInfo.down).removeClass(oInfo.up).addClass(oInfo.down).animate({ top: -oInfo.hContainer + 'px' }, function () { $container.removeClass(oInfo.down); });
                } else if (top - st < 0) {//scroll-up
                    if (!isNaN(t) && Math.abs(t) == 0) return;
                    if ($container.is(':animated')) {
                        if ($container.hasClass(oInfo.up)) return;
                        $container.removeClass(oInfo.down).unbind('animate');
                    }
                    $container.removeClass(oInfo.down).removeClass(oInfo.up).addClass(oInfo.up).animate({ top: 0 }, function () { $container.removeClass(oInfo.up); });
                }
            })(_scrollTop);

            if (top > 0) $top.show(); else $top.hide();
        });

        $defaultA.click();

        function setActive(href) {
            var flag = arguments.length > 1 && typeof (arguments[1]) == 'boolean' ? arguments[1] : false;
            $divs.find('li').removeClass(activeClassName).find('a[href="' + href + '"]').parent().addClass(activeClassName);
            if (flag) {
                window.location.href = href;
            }
        }
        function getPart(href) {
            var $part = $(getDiv(href));
            if ($part.hasClass('overview')) {
                $part = $part.add($('body>div.page-content-wrapper>div.product-info>div.related-products,body>div.page-content-wrapper>div.product-info-basic,body>div.page-content-wrapper>div.product-info>div.highlights-note'));
            }
            return $part;
        }
        function getDiv(href) {
            return document.getElementById('div_' + href.split('#')[1]);
        }
        function getOffsetTop(div) {
            var flag = arguments.length > 1 && typeof (arguments[1]) == 'boolean' ? arguments[1] : false;
            var offsetTop = 0;
            var $h2 = $(div).find('h2');
            var h2Height = $h2.length > 0 ? $h2[0].clientHeight : 0;
            var top = tpWeb.fn.getOffsetTop(div);
            if (!$(div).hasClass('overview') && top > 0) {
                if (flag) offsetTop = top;
                else offsetTop = top - (navHeight - h2Height);
            }
            return offsetTop;
        }
    };
	o.initList = function ($rows) {
        if ($rows.children('.col').length == 0) return;
        var isBiz = arguments.length > 1 && typeof (arguments[1]) == 'boolean' ? arguments[1] : false;
        $rows.each(function () {
            var $row = $(this);
            var $cols = $row.children('.col');
            var productImageClassName = 'product-image';
            var loadCssClassName = 'onload-flag';
            var $imgs = $cols.find('img.' + productImageClassName).addClass(loadCssClassName);
            $cols.each(function () {
                var $col = $(this);
                (function ($awards) {
                    var $imgAwards = $awards.children('img');
                    if ($imgAwards.length == 0) $awards.remove();
                    else {
                        $imgAwards.each(function () {
                            var img = this;
                            img.style.display = 'none';
                            var maxHeight = 40;
                            var newImg = new Image();
                            newImg.onload = function () {
                                if (this.height - 40 > 0) { img.setAttribute('height', '40'); }
                                img.style.display = '';
                            };
                            newImg.src = img.src;
                        });
                    }
                })($cols.children('.awards'));
            });
            var maxHeight = 0;
            $imgs.each(function () {
                var img = this;
                var parent = img.parentNode;
                var imgNew = new Image();
                imgNew.onload = function () {
                    (function (w, maxWidth) {
                        if (w - maxWidth > 0) w = maxWidth;
                        img.style.width = (w / maxWidth * 100) + '%';
                    })(this.width, $(parent).width());
                    $(img).removeClass(loadCssClassName);
                    maxHeight = Math.max(img.height, maxHeight);
                    handler();
                };
                imgNew.onerror = function () {
                    $(img).removeClass(loadCssClassName);
                    handler();
                };
                imgNew.src = img.src;
                function handler() {
                    if ($imgs.filter('.' + loadCssClassName).length == 0) {
                        $imgs.each(function () {
                            var $img = $(this);
                            var w = $img.parent().width();
                            $img.css({ position: 'absolute', bottom: '0', left: isBiz ? '0' : ((w - $img.width()) / 2 / w * 100 + '%') });
                        }).parent().height(maxHeight).css('position', 'relative');
                    }
                }
            });
        });
    };
    o.initAwards = function ($rows) {
        var isReviews = function ($li) {
            $dl = $li.parent().parent().parent();
            return $dl.hasClass('reviews');
        };
        var $logos = $rows.find('.logo');
        var aMaxSize = [Math.max($logos.width(), 120), Math.max($logos.height(), 60)];
        $rows.find('.logo').each(function () {
            var $span = $(this);
            var $img = $span.find('img');
            (function (img) {
                img.onload = function () {
                    var size = tpWeb.fn.getScaledSize([this.width, this.height], aMaxSize);
                    var o = { width: (size[0] / aMaxSize[0] * 100) + '%' };
                    if (!isReviews($span.parent())) {
                        o['position'] = 'relative';
                        o['top'] = (aMaxSize[1] - size[1]) / 2 + 'px';
                    }
                    $img.css(o);
                };
                img.src = $img.attr('src');
            })(new Image());
        });
    };
    o.initPositionSiblingMenu = function ($box, haveBg, $ul, className) {
        if ($box.length > 0 && haveBg == '1') {
            $box.append('<div class="bg"></div>');
        }
        if ($ul.length == 0) return;
        var isChild = function (elmContainer, elm) {
            var parent = elm;
            var flag = false;
            while (parent != null) {
                if (parent === elmContainer) {
                    flag = true;
                    break;
                }
                parent = parent.parentNode;
            }
            return flag;
        }
        $ul.children('li').bind('mouseout', function (evt) {
            var elm = evt.relatedTarget;
            if (!isChild(this, elm)) {
                $(this).children('.' + className).hide();
            }
        }).children('a,span').each(function () {
            var $li = $(this).parent();
            var $div = $li.children('.' + className).css({ 'visibility': 'hidden', 'display': 'block', 'top': $(this).parent().height() + 'px' });
            var w = $(this).width();
            var $ul = $div.children('ul');
            if ($ul.width() < w) $ul.width(w);
            $div.css({ 'visibility': 'visible', 'display': 'none' });
        }).mouseover(function () {
            $(this).parent().children('.' + className).show();
        });
    };
    o.playVideo = function ($aVideos) {
        if ($aVideos.length == 0) return;
        $aVideos.each(function () {
            var $img = $(this).find('img');
            if ($img.length == 0) return;
            (function (img, height) {
                img.onload = function () { $img.css('top', (height - this.height) / 2 / height * 100 + '%'); };
                img.src = $img.attr('src');
            })(new Image(), $img.parent().height());
        }).find('.icon-play, icon-play-small').append($('<u></u>')).append($('<i></i>'));
        tpWeb.fn.loadScript('/res/js/cxtutils/lightbox.js', function () {
            $aVideos.click(function () {
                var $a = $(this);
                var loadingClassName = 'loading';
                var aIframeSize = tpWeb.fn.getViewportSize();
                var r = parseFloat('0.8'); //Yahoo压缩后会对类似0.8这样的数字类型修改成0,8逗号分隔的值，因而改成字符串格式再进行数字解析(2016-02-17)
                aIframeSize = tpWeb.fn.getScaledSize([960, 720], [aIframeSize[0] * r, aIframeSize[1] * r]);
                aIframeSize[0] = Math.max(aIframeSize[0] * r, 400);
                aIframeSize[1] = Math.max(aIframeSize[1] * r, 300);
                var lightboxId = 'lightbox_video';
                cxtUtils.lightbox.show(
					  '<div class="utils clearfix">'
					+ '	<a href="javascript:;" class="close">Close</a>'
					+ '</div>'
					+ '<div class="content">'
					+ '	<div class="inner-box"></div>'
					+ '</div>',
					lightboxId,
					'lightbox-gallery video',
					'auto');
                $lightbox = $('#' + lightboxId);
                $lightbox.find('a.close').click(function () { $lightbox.remove(); });
                var $innerBox = $lightbox.find('.content>.inner-box').addClass(loadingClassName);
                var src = $a.attr('href');
                if ($a[0].tagName != 'A') src = $a.find('a').attr('href');
                var iframe = tpWeb.fn.loadVideoIframe(src,
					function (iframe) {
					    $(iframe).attr('width', aIframeSize[0])
								 .attr('height', aIframeSize[1])
								 .css({ width: aIframeSize[0] + 'px', height: aIframeSize[1] + 'px' });
					},
					function (iframe) { $innerBox.removeClass(loadingClassName); }
				).appendTo($innerBox);
                cxtUtils.lightbox[lightboxId].reposition();
                return false;
            });
        });
    };
    return o;
})();
tpWeb.support = (function () {
	var o = {};
	o.resizeHeight=(function(){
	  /**
     * @param {jquery Object} 需要进行调整高度的jQuery对象 
     * @param {boolean} 是否进行高度调整的判定条件
     */
	 var resize = function($items, $flag){
		$items.each(function(){
		  var maxHeight = 0;
		  var $child=$(this).children("li,dl");
		  $child.each(function(){
			var $this=$(this);
		    $(this).css("height", "auto");
			var temp = $(this).height();
			if($flag && temp > maxHeight){
				maxHeight = temp;
			}
		  });
		  $flag && $child.height(maxHeight);
		})
		//var maxHeight = 0;
//		$items.each(function(){
//			$(this).css("height", "auto");
//			var temp = $(this).height();
//			if($flag && temp > maxHeight){
//				maxHeight = temp;
//			}
//		})
//		$flag && $items.each(function(){
//			$(this).height(maxHeight);
//		})
	};
	/**
     * @param {jquery Object} 需要进行调整高度的jQuery对象 
     * @param {number} 是否进行高度调整的屏幕宽度分界线
     */
	 var bindEvent = function($items, $width){
		var $flag = true;
		$(window).on("resize", function(){
			$flag = ($(window).width() > $width) ? true : false;
			resize($items, $flag);
		}).resize();
	};
	/**
	 * @callback
     * @param {jquery Object} 需要进行调整高度的jQuery对象 
     * @param {number} 是否进行高度调整的屏幕宽度分界线，默认值为736
     */
	return function($items, $width){
		var $width = ($width == undefined || $width == null) ? 736 : $width;
		bindEvent($items, $width);
	};
	})();
	return o;
})();
tpWeb.search = (function () {
    var o = {};
    o.initProductResult = function () {
		var $box = $('#productResult');
        var loadingClassName = 'loading';
        var loadImage = function ($span, src, href) {
			var content = '<img src="' + tpWeb.fn.htmlEncode(src) + '"></a>';
            if (href != null && href != '') content = '<a href="' + tpWeb.fn.htmlEncode(href) + '" target="_blank">' + content + '</a>';
			var img = new Image();
			img.onload = function () {
                $span.removeClass(loadingClassName).html(content).find('img').css('width', (img.width / $span.width() * 100) + '%');
			};
            img.onerror = function () {
                $span.removeClass(loadingClassName).html(content);
            };
			img.src = src;
        };
        var showInfo = function ($li, src, href, name) {
            loadImage($li.children('.image'), src, href);
            var $dtA = $li.children('dl').children('dt').children('a');
            var cssClassName = 'disabled';
            $dtA.children('strong').html(name == null || name == '' ? $dtA.attr('data-name') : name);
            if (href == null || href == '') $dtA.removeAttr('href').addClass(cssClassName);
            else  $dtA.attr('href', href).removeClass(cssClassName);
        };
		$box.find('.image').addClass(loadingClassName).each(function () {
			var $span = $(this);
			var $img = $span.find('img');
            var $a = $img.parent();
            var href = $a.attr('href');
            var $statusIcon = $span.children('b.status-icon');
            if ($statusIcon.length > 0 && $span.parent().children('.status-icon').length == 0) {
                $span.parent().append($statusIcon);
            }
            loadImage($span, $img.attr('src'), typeof(href) == 'string' ? href : null);
            $span.attr('data-image', tpWeb.fn.htmlEncode($img.attr('src'))).attr('data-href', typeof(href) == 'string' ? tpWeb.fn.htmlEncode(href) : '');
            var $dtA = $span.parent().children('dl').children('dt').children('a');
            $dtA.attr('data-name', tpWeb.fn.htmlEncode($dtA.children('strong').html()));
		});
        var $select = $box.find('select').change(function () {
            var $li = $(this.parentNode.parentNode.parentNode.parentNode);
            var $imageSpan = $li.children('.image');
            var $option = $(this).children(':selected');
            var src = $option.attr('data-image');
            var name = $option.attr('data-name');
            var href = '';
            if ($option.val() == '' || $option.index() == 0) href = $imageSpan.attr('data-href');
            if (!(typeof(src) == 'string' && src != '')) src = $imageSpan.attr('data-image');
            showInfo($li, src, href, name);
        });
        $box.find('button').click(function () {
            var $form = $(this).parent('form');
            var $option = $form.find('option:selected');
			var href = $option.attr('data-href');
			if (!(typeof(href) == 'string' && href != '') && $select.children().length > 0) 
                href = $select.children('option').eq(0).attr('data-href');
            if (!(typeof(href) == 'string' && href != '')) href = $form.attr('action');
            window.open(href);
        });
    };
    return o;
})();
//20160706
tpWeb.onresize=(function(){
	var o={};
	o.setClass=function(){
	  var $body=$("body");
      var width=$(window).width();
	  if(width<=736&&!$body.hasClass("mobile-web")){
		 $body.addClass("mobile-web");
	  }else if(width>736&&$body.hasClass("mobile-web")){
	    $body.removeClass("mobile-web");
	  }
	};
  $(window).resize(function(){
	 o.setClass();
  });
  return o;
})();
tpWeb.mobileSiteNav=(function(){
  var o={};
  o.addStyle=function($navUl){
    var $li=$navUl.find("li");
	$li.each(function(){
	  var $this=$(this);
	  if($this.children("ul").length>0)$this.addClass("hassub").children("ul").addClass("sub-nav").hide();
	})
  };
  return o;
})();
tpWeb.addMobileEvent=(function(){
  var o={};
  $(document).on("click",".mobile-web .m-searchBtn",function(event){
    event.preventDefault();
	var $globalSearch=$(".search-box.global-search");
	if(!$globalSearch.hasClass("active")){
	$globalSearch.animate({
		  height:"40px"
		},function(){$(this).addClass("active").removeAttr("style");})
	}else{
	  $globalSearch.animate({
		  height:"0px"
		},function(){$(this).removeClass("active").removeAttr("style");})
	}
  });
  $(document).on("menupage",function(event){//预定义事件
    event.preventDefault();
	var $page=$(".page-content-wrapper");
	var $mLayer=$(".m-layer");
	if(!$page.hasClass("active")){
		$page.animate({
			  left:"-83%"
			},function(){$(this).addClass("active").removeAttr("style");});
		$mLayer.show(500,function(){$(this).removeAttr("style")});
	}else{
	  $page.animate({
			  left:"0"
			},function(){$(this).removeClass("active").removeAttr("style");});
	  $mLayer.hide(function(){$(this).removeAttr("style")});
	}
  });
  $(document).on("click",".mobile-web .m-navBtn,.mobile-web .m-layer,.mobile-web .m-navClose",function(event){
	  $(this).trigger("menupage");
  });
  $(document).on("click",".m-nav-box .clearfix a",function(event){
	  var $this=$(this);
	  var parentLi=$this.parent("li");
	  if(parentLi.hasClass("hassub")){
	    event.preventDefault();
		if(parentLi.parents("ul").length==1&&parentLi.index()==0){
		  parentLi.children("ul").children("li").eq(0).children("ul").show().siblings("a").toggleClass("active");//默认展开Home Network的子菜单;
		}
		parentLi.children("ul").slideToggle(function(){
		  if($(this).css("display")=="none")$(this).find("ul").hide();	
		});
		parentLi.siblings("li").children("ul").slideUp(function(){
		  $(this).siblings("a").removeClass("active");
		  $(this).find("ul").hide().siblings("a").removeClass("active");	
		});
		$this.toggleClass("active");
	  }
  });
})();
// 添加自定义字体样式
(function (){
	var addFontStyle = function(name, url) {
		var style = document.createElement("style"),
			cssText;
		if (name && url) {
			var type = /^data\:application\/font\-woff/i.test(url) ? " format(\"woff\")" : "";
			cssText = "@font-face{font-family:\"" + name + "\";src: url(" + url + ")"+type+"; font-weight: normal; font-style: normal;}"
		} else {
			cssText = name;
		}
		style.type = "text/css";
		if (style.styleSheet) { // for IE
			style.styleSheet.cssText = cssText;
		} else {
			style.innerHTML = cssText;
		}
		document.getElementsByTagName("head")[0].appendChild(style);
	},
	// 加载单个自定义字体
	loadCustomFont = function(name, file, defaultStyle) {
		// 检测本地是否存在字体
		var dataURL = null;
		if (window.localStorage && localStorage.getItem && !(/msie\s8/i.test(navigator.userAgent))) {
			if ((dataURL = localStorage.getItem(name)) != null) {
				// 存在直接从本地读取
				addFontStyle(name, dataURL);
			} else {
				// 不存在时从服务器请求文件
				$.ajax({
					url: file,
					// 成功时加载得到的文件
					success: function(data) {
						localStorage.setItem(name, data);
						addFontStyle(name, data);
					},
					// 失败时使用默认样式
					error: function() {
						addFontStyle(defaultStyle);
					}
				})
			}
		} else {
			addFontStyle(defaultStyle);
		}
	},
	/// 自定义字体(IE、其它)
	fonts = [{
		name: "AktivGrotesk-Bold",
		file: "/res/style/fonts/aktivgrotesk-bold/woff.base64.txt"
	}, {
		name: "AktivGrotesk-Light",
		file: "/res/style/fonts/aktivgrotesk-light/woff.base64.txt"
	}, {
		name: "AktivGrotesk-Medium",
		file: "/res/style/fonts/aktivgrotesk-medium/woff.base64.txt"
	}, {
		name: "AktivGrotesk-Regular",
		file: "/res/style/fonts/aktivgrotesk-regular/woff.base64.txt"
	}],
	// 字体加载不成功时的默认样式
	defaultStyle = {
		"AktivGrotesk-Bold": "@font-face {	font-family: 'AktivGrotesk-Bold';	src: url('/res/style/fonts/aktivgrotesk-bold/AktivGrotesk_W_Bd.eot');	src: url('/res/style/fonts/aktivgrotesk-bold/AktivGrotesk_W_Bd.eot?#iefix') format('embedded-opentype'),  url('/res/style/fonts/aktivgrotesk-bold/AktivGrotesk_W_Bd.woff') format('woff'),  url('/res/style/fonts/aktivgrotesk-bold/AktivGrotesk_W_Bd.ttf') format('truetype'),  url('/res/style/fonts/aktivgrotesk-bold/AktivGrotesk_W_Bd.svg#AktivGrotesk-Bold') format('svg');	font-weight: normal;	font-style: normal;}",
		"AktivGrotesk-Light": "@font-face {	font-family: 'AktivGrotesk-Light';	src: url('/res/style/fonts/aktivgrotesk-light/AktivGrotesk_W_Lt.eot');	src: url('/res/style/fonts/aktivgrotesk-light/AktivGrotesk_W_Lt.eot?#iefix') format('embedded-opentype'),  url('/res/style/fonts/aktivgrotesk-light/AktivGrotesk_W_Lt.woff') format('woff'),  url('/res/style/fonts/aktivgrotesk-light/AktivGrotesk_W_Lt.ttf') format('truetype'),  url('/res/style/fonts/aktivgrotesk-light/AktivGrotesk_W_Lt.svg#AktivGrotesk-Light') format('svg');	font-weight: normal;	font-style: normal;}",
		"AktivGrotesk-Medium": "@font-face {	font-family: 'AktivGrotesk-Medium';	src: url('/res/style/fonts/aktivgrotesk-medium/AktivGrotesk_W_Md.eot');	src: url('/res/style/fonts/aktivgrotesk-medium/AktivGrotesk_W_Md.eot?#iefix') format('embedded-opentype'),  url('/res/style/fonts/aktivgrotesk-medium/AktivGrotesk_W_Md.woff') format('woff'),  url('/res/style/fonts/aktivgrotesk-medium/AktivGrotesk_W_Md.ttf') format('truetype'),  url('/res/style/fonts/aktivgrotesk-medium/AktivGrotesk_W_Md.svg#AktivGrotesk-Medium') format('svg');	font-weight: normal;	font-style: normal;}",
		"AktivGrotesk-Regular": "@font-face {	font-family: 'AktivGrotesk-Regular';	src: url('/res/style/fonts/aktivgrotesk-regular/AktivGrotesk_W_Rg.eot');	src: url('/res/style/fonts/aktivgrotesk-regular/AktivGrotesk_W_Rg.eot?#iefix') format('embedded-opentype'),  url('../fonts/aktivgrotesk-regular/AktivGrotesk_W_Rg.woff') format('woff'),  url('/res/style/fonts/aktivgrotesk-regular/AktivGrotesk_W_Rg.ttf') format('truetype'),  url('/res/style/fonts/aktivgrotesk-regular/AktivGrotesk_W_Rg.svg#AktivGrotesk-Regular') format('svg');	font-weight: normal;	font-style: normal;}"
	};
	if(/msie\s8/i.test(navigator.userAgent)){
		for(var d in defaultStyle){
			addFontStyle(defaultStyle[d]);
		}
	}else{
		for(var i=0;i<fonts.length;i++){
			var font = fonts[i];
			loadCustomFont(font.name, font.file, defaultStyle[font.name]);
		}
	}
})();