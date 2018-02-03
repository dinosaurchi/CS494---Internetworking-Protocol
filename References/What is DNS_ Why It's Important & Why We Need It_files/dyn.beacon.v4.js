var dynbeacon = (function() {
function DynBeacon(sid, cdata, inject_domain, collect_cback) {

    this.inject_domain=inject_domain != null ? inject_domain:'//beacon.rum.dynapis.com';
    this.collected=false;
    this.sid = sid;
    this.cdata = cdata;
    this.beaconUrl = null;
    this.bid = null;
    this.defer = 15000;
    this.collect_cback = collect_cback;
    this.force_xmlhttp = false;
    this.gets = [];
    this.target_cnt = 0;

    this.findResource = function (url) {
	var i;
	for (i=0; i < document.images.length;i++) {var img=document.images[i];if (img.src == url) {return img;}}
	for (i=0; i < document.scripts.length;i++) {var script=document.scripts[i];if (script.src == url) {return script;}}
	return null;
    }

    this.getTimingIndexes = function (bid) {
	var missing=[];
	var resources=[];
	try {
	    resources = window.performance.getEntriesByType('resource');
	} catch(ex) {
	}
	var tests = document.getElementsByClassName(bid); 
	var results = {};
	
	// include gets
	var ajax = []
	for (var i = 0; i < this.gets.length; i++) {
	    var test_info = this.gets[i]
	    ajax.push(test_info.url)
	    if (test_info.duration != 0) 
		results[test_info.url] = i;
	    else
		results[test_info.url] = -1;
	}

	// include matched resource elements
	for (var i=0;i<tests.length;i++)
	{
	    var k=tests[i].src;
	    results[k]=-1;
	}

	for (var i=0; i<resources.length;i++) { 
	    var timing=resources[i];
	    var k=timing.name;
	    if (ajax.indexOf(k) != -1 && results[k] != -1 && results[k] != undefined) {
		results[k] = i;
	    }
	    else if (results[k] == -1) {
		results[k] = i;
	    }
	}
	for(var k in results){
	    if(results[k]==-1)missing.push(k);
	}
	return {'timings':results,'missing':missing};
    }

    this.createTimingSeries = function() {
	var resources=[];
	var cnt=0;var headers=[];var timings = this.getTimingIndexes(this.bid);
	var indexes = timings['timings'];

	try {
	    resources=window.performance.getEntriesByType('resource');
	} catch(e) {
	}

	for (var key in indexes) {
	    var residx=indexes[key]; 
	    var resource=null;
	    if(residx !=-1) {
		resource=resources[residx];
	    }
	    var resElement=this.findResource(key);
	    var oid = null;
	    var size = null;
	    var rid = null;
	    var request = null;
	    var ajaxDuration = 0;
	    if (resElement==null) {
		// See if we have it via gets
		for (var i = 0; i < this.gets.length; i++) {
		    if (this.gets[i].url == key) {
			var info = this.gets[i];
			oid = info.oid;
			size = info.size;
			rid = info.rid;
			request = info.request;
			ajaxDuration = info.duration;
			break;
		    }
		}
	    } else {
		oid  =resElement.getAttribute('data_orgid');
		size =resElement.getAttribute('data_size');
		rid  =resElement.getAttribute('data_resid');
	    }
	    if (oid!=null) {
		var t2dns=-9000000000000000; var t2tls=0;var t2conn=t2dns;var t2fb=t2dns; var t2lb=t2dns;var t2dur=t2dns; 
		if(resource!=null) {
		    t2dns=resource.domainLookupEnd-resource.domainLookupStart;
		    if(isNaN(t2dns))t2dns=0; 
		    t2conn=resource.connectEnd-resource.connectStart;if(isNaN(t2conn))t2conn=0;
		    t2tls=resource.secureConnectionStart?(resource.connectEnd-resource.secureConnectionStart):0;if(isNaN(t2tls))t2tls=0;
		    t2fb=resource.responseStart-resource.requestStart;if(isNaN(t2fb))t2fb=0;
		    t2lb=resource.responseEnd-resource.responseStart;if(isNaN(t2lb))t2lb=resource.duration;
		    t2dur=resource.duration;if(t2lb==0)t2lb=t2dur;
		} else if (this.force_xmlhttp || ajaxDuration != 0) {
		    t2dns = 0;
		    t2conn = 0;
		    t2tls = 0;
		    t2fb = 0;
		    t2lb = 0;
		    t2dur = ajaxDuration;
		}
		var info = [size,oid,rid,t2dns.toFixed(3),t2conn.toFixed(3),t2fb.toFixed(3),t2lb.toFixed(3),t2dur.toFixed(3),t2tls.toFixed(3)]
		if (request != null && request.readyState == XMLHttpRequest.DONE) {
		    var id=null;
		    try {
			if (oid == "44311") {
			    id =request.getResponseHeader("X-Amz-Cf-Id")
			}
			else if (oid == "4435") {
			    id =request.getResponseHeader("X-Served-By")
			}
			else if (oid == "4434") {
			    id = request.getResponseHeader("Server")
			}
			else if (oid == "44310") {
			    id =request.getResponseHeader("X-CF1")
			}
			else if (oid == "4439") {
			    id =request.getResponseHeader("X-HW")
			    id = id.split(",")[0]
			}
			else if (oid == "4438") {
			    id =request.getResponseHeader("cf-ray")
			}

			if (id != null) {
			    id = id.replace(/,/g,":")
			    id = id.replace(/ /g,"-")
			    info.push(id);
			}
		    } catch(ee) {
		    }
		}
		headers.push(info.join(','));  
	    }
	}
	return {'headers':headers,'missing':timings['missing']};
    }

    this.collect = function(report_if_missing) {

        if (this.collected) return;
        var INFO = this.createTimingSeries();
        if (INFO == null || INFO.missing == undefined) {
            return;
        }

        if (!report_if_missing && INFO.missing.length > 0) {
            return false;
        }

        if (!report_if_missing && INFO.headers.length != this.target_cnt) {
            return false;
        }
	    
	if (INFO.headers.length == 0) {
	    return false;
	}

	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open('PUT', this.beaconUrl, true);
	for(var index=1;index<=INFO.headers.length;index++) 
	{
	    var idx=(index<10?'0':'')+index;
	    var hdr='r'+idx;
	    xmlhttp.setRequestHeader(hdr,INFO.headers[index-1]);
	}
	var send = true;
	if (this.collect_cback) {
	    send = this.collect_cback(INFO.headers);
	}
	if (send) {
	    xmlhttp.send();
	}
	this.collected = true;
	this.cleanup();
	
	return true;
    }

    this.cleanup = function() {
	if (this.bid != null) {
	    var items = document.getElementsByClassName(this.bid);
	    for (var i =items.length-1;i >= 0; i--) {
		var item = items[i];
		document.body.removeChild(item)
	    }
	}
	this.gets = []
    }

    this.pullTest = function(url, data) {
	var pull = new XMLHttpRequest()
	var self = this;
	pull.open('GET',url, true)
	var startTime = new Date().getTime()
	data["request"] = pull
	pull.onreadystatechange = function() {
	    if (pull.readyState == XMLHttpRequest.DONE) {
		
		var duration = new Date().getTime() - startTime;
		data["duration"] = duration;
		self.gets.push(data)
	    }
	}
	pull.send()
    }

    this.inject = function() {
	var injecturl = this.inject_domain+'/inject/'+this.sid+'/'+this.cdata;
	if (location.protocol == "file:" && injecturl.indexOf("//") == 0) {
	    injecturl = "http:"+injecturl
	}

	var inject = new XMLHttpRequest();
	var self = this;
	this.collected = false;
	this.target_cnt = 0;

	inject.open('GET', injecturl, true);
	inject.onreadystatechange = function() {
	    if (inject.readyState == XMLHttpRequest.DONE && inject.status == 200) {
		self.beaconUrl = inject.responseText;
		if (location.protocol == "file:" && self.beaconUrl.indexOf("//") == 0)
		    self.beaconUrl = "http:"+self.beaconUrl
		self.bid = self.beaconUrl.split('-')[2].split(".")[0];
		var beacon = new XMLHttpRequest();
		beacon.onreadystatechange = function() {
		    if (beacon.readyState == XMLHttpRequest.DONE && beacon.status == 200) {
			var targets = beacon.responseText.split("\n");
			for (var i =0; i < targets.length; i++) {
			    var t = targets[i];
			    if (t != "") {
				self.target_cnt++;
				var parts = t.split(",");
				if (parts[0] == "http" || parts[0] == "https") {
				    var path = parts[2]
				    var nonce = new Date().getTime();
				    if (path.indexOf("%2C") != -1) {
					path = path.replace(/%2C/g,",")
				    } else {
					if (path.indexOf("?") != -1)
					    path += "&foo="+nonce;
					else
					    path += "?foo="+nonce;
				    }
				    var url = parts[0]+"://"+parts[1]+path;
				    var oid = parts[4]
				    if (self.force_xmlhttp || oid == "44311" || oid=="4435" || oid=="4434" || oid=="4439" || oid=="4438" || oid=="44310") {
					var testData = {"url":url,"size":parts[3],"oid":oid,"rid":parts[5],"duration": 0};
					self.pullTest(url, testData)
				    } else {
					var img = document.createElement("img");
					img.src = url;
					img.setAttribute("data_size",parts[3]);
					img.setAttribute("data_orgid",oid);
					img.setAttribute("data_resid",parts[5]);
					img.style.display = "none";
					img.className = self.bid;
					document.body.appendChild(img);
				    }
				    
				}
			    }
			}
		    }
		}
		beacon.open('GET', self.beaconUrl, true);
		beacon.setRequestHeader('as-url','1');
		beacon.send();
	    }
	}
	inject.send();
	return true
    }

    this.test = function(delay, cnt) {

	if (!this.force_xmlhttp) {
	    try {
		window.performance.clearResourceTimings()
	    } catch(ex) {
		this.force_xmlhttp = true;
	    }
	}

	if (delay == null) delay = 15000;
	if (cnt == null) cnt = 1;
	this.defer = delay;
	this.defer_cnt = 1;
	this.defer_cnt_max = Math.floor(delay/1000);
	if (this.inject()) {
	    var self = this;
	    this.interval = setInterval(function() {
		self.defer_cnt++;
		if (self.collected) {
		    clearInterval(self.interval);
		}
		if (self.defer_cnt <= self.defer_cnt_max) {
		    var collected = self.collect(self.defer_cnt == self.defer_cnt_max ? true : false);
		    if (collected) {
			clearInterval(self.interval);
			cnt--;
			if (cnt > 0)
			    self.test(delay, cnt);
		    }
		}
	    }, 1000);
	}
    }
}

try {
    // Test to determine whether or not the window.performance capability is in this browser.
    // Intentionally catch error silently and don't do anything with this user agent.
    var defer = 3000;
    var fail = 15000;
    // Find element by required id. If not present, do nothing.
    var elt = document.getElementById('beaconcfg');
    if (elt) {
	// Determine if there is non-default defer (wait until execute).
	// Defensively handle typos in the data-deter value.
	var new_defer = parseInt(elt.getAttribute('data-defer'));
	var new_fail = parseInt(elt.getAttribute('data-fail'));
	if (!isNaN(new_defer) && new_defer >= 1000) {
	    defer = new_defer;
	}
	if (!isNaN(new_fail) && new_fail >= 1000) {
	    fail = new_fail;
	}
	var cdata = "0";
	var sid = elt.getAttribute('data-id');
	if (sid != null) {
	    var data = elt.getAttribute('data-other');
	    if (data != null) cdata = data;
	    var doTest = function() {
		var beacon = new DynBeacon(sid, cdata, null, completeCallback);
		beacon.test(fail);
	    }
	    var completeCallback = function(headers) {
		setTimeout(function(){doTest()}, 120000)
		return true;
	    }
	    setTimeout(function() {doTest()}, defer);
	}
    }
} catch(ex) {
    console.log(ex.message);
}

return {
    create:function(sid, cdata, domain, callback) {
	return new DynBeacon(sid, cdata, domain, callback);
    }
}

}());
