if(/(Android)/i.test(navigator.userAgent)) {
	document.body.classList.add('my-androids');
} else {
	document.body.classList.remove('my-androids');
}


//querySelect
function el(dom) {
	if(dom.indexOf('#') >= 0 && dom.indexOf(' ') < 0) {
		return document.querySelector(dom);
	}
	return document.querySelectorAll(dom);
}

//DOM show,hide
HTMLElement.prototype.show = function() {
	this.style.display = 'block';
}
HTMLElement.prototype.hide = function() {
	this.style.display = 'none';
}
//是否包含
function isChildOf(child, parent) {
	function getChild(child, parent) {
		var parentNode;
		if(child && parent) {
			parentNode = child.parentNode;
			while(parentNode) {
				if(parent === parentNode || parent === child) {
					return true;
				}
				parentNode = parentNode.parentNode;
			}
		}
		return false;
	}
	if(Object.prototype.toString.call(parent) === '[object NodeList]') {
		var m = Array.prototype.some.call(parent, function(item) {
			return getChild(child, item);
		});
		return m;
	} else {
		return getChild(child, parent);
	}
}

//jq closet();
function getParents(el, parentSelector /* optional */ ) {

	// If no parentSelector defined will bubble up all the way to *document*
	if(parentSelector === undefined) {
		parentSelector = document;
	}
	var parents = [];
	var p = el.parentNode;
	if(typeof parentSelector === 'string') {
		var parCla = parentSelector.replace(/[.#]/g, "");

		while(!p.classList.contains(parCla)) {
			var o = p;

			parents.push(o);
			if(o === document.children[0]) {
				break;
			}
			p = o.parentNode;
		}
	} else {
		while(p !== parentSelector) {
			var o = p;
			parents.push(o);
			p = o.parentNode;
		}
	}

	parents.push(p); // Push that parentSelector you wanted to stop at
	return parents[parents.length - 1];
}

//jq siblings() sel只能是类名
function getSiblings(dom, sel) {
	var nodes = [];
	var previ = dom.previousSibling;
	while(previ) {
		if(previ.nodeType === 1 && (sel ? previ.classList.contains(sel) : true)) {
			nodes.push(previ);
		}
		previ = previ.previousSibling;
	}
	nodes.reverse();
	var nexts = dom.nextSibling;
	while(nexts) {

		if(nexts.nodeType === 1 && (sel ? nexts.classList.contains(sel) : true)) {
			nodes.push(nexts);
		}
		nexts = nexts.nextSibling;
	}
	return nodes;
}
//mask
function openMask() {
	var mask = el('#masking');
	var n = Number(mask.getAttribute('data-mask')) || 0;
	n++;
	mask.setAttribute('data-mask', n)
	mask.show();
}

function closeMask() {
	var mask = el('#masking');
	var n = Number(mask.getAttribute('data-mask'));
	if(n && n > 1) {
		n = (n - 1) || 0;
	} else {
		n = 0;
		mask.hide();
	}
	mask.setAttribute('data-mask', n)
}

//dialog
function openDialog(id) {
	var dialog = el('#' + id);
	openMask();
	dialog.show();
}

function closeDialog(id) {
	var dialog = el('#' + id);
	closeMask();
	dialog.hide();
}
//错误提示
function tips(text) {
	var m;
	clearTimeout(m);
	var tips = el('#tips');
	openMask();
	tips.children[0].innerText = text || '错误';
	tips.show();
	m = setTimeout(function() {
		closeMask();
		tips.hide();
		tips.children[0].innerHTML = '';
	}, 1000);
}
//ajax

function ajax(opt) {
	var timeOutId = null;
	var isTimeOut = false;
	timeOutId && clearTimeout(timeOutId);
	opt = opt || {};
	opt.timeOut = opt.timeOut || 15000; //默认15秒超时
	opt.dev = opt.dev || true; //开发环境,默认生产环境
	opt.baseURL = 'http://192.168.29.15:8088/data/' || opt.baseURL;
//	opt.method = opt.method ? opt.method.toUpperCase() : 'POST';
	opt.method = 'GET';
	opt.url = (opt.dev ? (opt.baseURL + (opt.url || '')) : '/activeServlet');
	//opt.url = (opt.dev ? (opt.baseURL + (opt.url || '')) : 'http://10.30.251.59:8080/activeServlet');
	opt.async = opt.async || true;
	opt.data = opt.data || null;
	opt.success = opt.success || function() {};
	opt.error = opt.error || function() {};
	opt.complete = opt.complete || function() {};
	opt.dom = opt.dom || null;
	opt.loading = opt.loading || null;
	var xmlHttp = null;
	if(XMLHttpRequest) {
		xmlHttp = new XMLHttpRequest();
	} else {
		xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
	}
	var params = [];
	for(var key in opt.data) {
		params.push(key + '=' + opt.data[key]);
	}
	var postData = params.join('&');
	if(opt.loading) {
		openMask();
		opt.loading.show();
	}
	timeOutId = setTimeout(function() {
		isTimeOut = true;
	}, opt.timeOut);

	if(opt.method.toUpperCase() === 'POST') {
		xmlHttp.open(opt.method, opt.url, opt.async);
		xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
		xmlHttp.send(postData);
	} else if(opt.method.toUpperCase() === 'GET') {
		var url = opt.data ? opt.url + '?' + postData : opt.url;
		xmlHttp.open(opt.method, url, opt.async);
		xmlHttp.send(null);
	}
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4) {
			if(isTimeOut) {
				console.log('http超时');
				if(opt.loading) {
					closeMask();
					opt.loading.hide();
				}
				return;
			}
			if(xmlHttp.status == 200) {
				var res = xmlHttp.response ? JSON.parse(xmlHttp.response) : {};
				if(res.result !== 1) {
					if(res.result === -999) {
						clearInterval(TIMER['HOME']);
						clearInterval(TIMER['vali']);
						clearInterval(TIMER['ac2']);
						clearInterval(TIMER['INFO']);
						clearInterval(TIMER['COUNT']);
						var reloadUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx56e4c5faadaaff01&redirect_uri=http%3A%2F%2Fxz.weihuyun.cn%2FWxInfoServlet&response_type=code&scope=snsapi_userinfo&state=&connect_redirect=1#wechat_redirect";
						window.location.href = reloadUrl;
					}
					if(opt.dom) {
						opt.dom.innerText = res.msg;
					} else {
						if(!res.status) {
							tips(res.msg);
						}

					}
				}
				opt.success(res);
			} else {
				if(opt.dom) {
					opt.dom.innerText = xmlHttp.status + '-' + xmlHttp.statusText;
				} else {
					if(xmlHttp.status != 0) {
						tips(xmlHttp.status + '-' + xmlHttp.statusText);
					}

				}
				opt.error(xmlHttp);
			}
			timeOutId && clearTimeout(timeOutId);
			if(opt.loading) {
				closeMask();
				opt.loading.hide();
			}
			opt.complete(xmlHttp);
		}
	};
}

//时间格式化
function timeFtt(date, fmt) { //author: meizz
	(typeof date === 'string') && (date = date.replace(/-/g, '/'));
	var DateStr = new Date(date);
	if(DateStr == 'Invalid Date') {
		return '';
	}
	var fmt = fmt || "yyyy-MM-dd hh:mm:ss";
	var date = DateStr;
	var o = {
		"M+": date.getMonth() + 1, //月份
		"d+": date.getDate(), //日
		"h+": date.getHours(), //小时
		"m+": date.getMinutes(), //分
		"s+": date.getSeconds() //秒
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

//只获取日期
function dateFtt(val) {
	return timeFtt(val, 'yyyy-MM-dd');
}
//年月日
function dateFttCN(val) {
	return timeFtt(val, 'yyyy年MM月dd日');
}

//月日 下午
function dateFttLocal(val) {
	if(val != null) {
		(typeof val === 'string') && (val = val.replace(/-/g, '/'));
		var date = new Date(val);
		var hous = date.getHours();
		var hours = '';
		if(hous >= 12) {
			if(hous >= 18) {
				hours = '晚' + (date.getHours() - 12);
			} else {
				hours = '下午' + (date.getHours() - 12);
			}
		} else {
			if(hous >= 6) {
				hours = '上午' + date.getHours();
			} else {
				hours = '早' + date.getHours();
			}
		}
		return(date.getMonth() + 1) + '月' + date.getDate() + '日&emsp;' + hours + '点';
	} else {
		return '';
	}
}

function dateFttNoMini(val) {
	return timeFtt(val, 'yyyy年MM月dd日 hh:mm');
}

function dateFttCNDian(val) {
	return timeFtt(val, 'yyyy年MM月dd日hh点');
}
var ONEDAY = 86400000; //一天
var TIMER = {}; //定时器

function regPhone(num) {
	var phoneReg = /^1[0-9]{10}$/; //手机号匹配
	return phoneReg.test(num.toString());
}




//倒计时
function countDownTm(rightTime, prize_st) {
	//时间计算
	var cutTm = prize_st - rightTime;
	if(cutTm > 0) {
		var ds = Math.floor(cutTm / 1000 / 60 / 60 / 24);
		var hs = Math.floor(cutTm / 1000 / 60 / 60 % 24);
		var ms = Math.floor(cutTm / 1000 / 60 % 60);
		var ss = Math.floor(cutTm / 1000 % 60);
		el('#time-day .up')[0].innerHTML = ds;
		el('#time-day .down-wrap')[0].innerHTML = ds;
		el('#time-houer .up')[0].innerHTML = hs;
		el('#time-houer .down-wrap')[0].innerHTML = hs;
		el('#time-minu .up')[0].innerHTML = ms;
		el('#time-minu .down-wrap')[0].innerHTML = ms;
		el('#itme-sec .up')[0].innerHTML = ss;
		el('#itme-sec .down-wrap')[0].innerHTML = ss;
	}

};

