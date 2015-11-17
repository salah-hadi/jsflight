/*
May it be usefull - download scenario just from browser

https://github.com/eligrey/FileSaver.js
var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
saveAs(blob, "hello world.txt");
 */

// jsflight namespace 
var jsflight = jsflight || {}

/* =================================================================================================================================== */
/** Global variables * */
// event id
jsflight.eventId = 0;

// browser window/tab uuid
jsflight.tabUuid = '';

// recorder options
jsflight.options = {
	// should record be started after page loaded
	autostart : false,
	// baseUrl to reach servlet. useful when logger is outside an web-app
	baseUrl : '',
	// url to find servlet to send data
	downloadPath : '/jsflight/recorder/storage',
	// url to find servlet to view status
	statusPath : '/jsflight/recorder/status',
	trackMouse : false,
	trackHash : false,
	trackXhr : false,
	track_duration : -1,
	send_interval : -1,
	propertyProvider : function(prop) {
	}
}
/* =================================================================================================================================== */

/**
 * Based on firebug method of getting xpath of dom element
 */
jsflight.getElementXPath = function(element) {
	if (element && element.id)
		return '// *[@id="' + element.id + '"]';
	else
		return jsflight.getElementTreeXPath(element);
}

jsflight.getElementTreeXPath = function(element) {
	var paths = [];

	// Use nodeName (instead of localName) so namespace prefix is included (if
	// any).
	for (; element && element.nodeType == 1; element = element.parentNode) {
		var index = 0;
		for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
			// Ignore document type declaration.
			if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
				continue;

			if (sibling.nodeName == element.nodeName)
				++index;
		}

		var tagName = element.nodeName.toLowerCase();
		var pathIndex = (index ? "[" + (index + 1) + "]" : "");
		paths.splice(0, 0, tagName + pathIndex);
	}

	return paths.length ? "/" + paths.join("/") : null;
}

/**
 * Make json of mouse event.
 * 
 * @param mouseEvent
 * @returns {___anonymous1625_1630}
 */
jsflight.getEventInfo = function(mouseEvent) {
	if (mouseEvent === undefined)
		mouseEvent = window.event;

	var target = 'target' in mouseEvent ? mouseEvent.target
			: mouseEvent.srcElement;

	mouseEvent.target = target;

	var result = new Object;
	// To be really sure what target element was, it may be useful to hold the
	// whole path to target element
	// var path = mouseEvent.path;
	// var xpaths = [];
	// for(var i=0;i<path.length;i++){
	// if(path[i] && path[i]!=document && path[i]!=window){
	// xpaths.push(getElementXPath(path[i]))
	// }
	// }
	// result['path'] = xpaths;

	result['tabuuid'] = jsflight.tabUuid;
	result['type'] = mouseEvent.type;
	result['url'] = window.location.href;
	result['charCode'] = (event.which || event.keyCode || mouseEvent.charCode);

	if (mouseEvent.type === 'keyup') {
		if (!event.shiftKey) {
			result['charCode'] = String.fromCharCode(result['charCode'])
					.toLowerCase().charCodeAt(0);
		}
	}
	result['altKey'] = event.altKey;
	result['ctrlKey'] = event.ctrlKey;
	result['shiftKey'] = event.shiftKey;
	result['metaKey'] = event.metaKey;

	result['button'] = mouseEvent.button;
	result['hash'] = window.location.hash;

	result['target'] = jsflight.getElementXPath(mouseEvent.target);
	result['timestamp'] = mouseEvent.timeStamp;

	result['screenX'] = mouseEvent.screenX;
	result['screenY'] = mouseEvent.screenY;

	result['pageX'] = mouseEvent.pageX;
	result['pageY'] = mouseEvent.pageY;

	result['screen.width'] = screen.width;
	result['screen.height'] = screen.height;

	result['window.width'] = window.outerWidth;
	result['window.height'] = window.outerHeight;

	result['page.width'] = window.innerWidth;
	result['page.height'] = window.innerHeight;

	if (jsflight.options.propertyProvider) {
		jsflight.options.propertyProvider(result);
	}

	return result;
}

/**
 * Store event to session storage
 * 
 * @param eventid
 * @param eventdata
 */
jsflight.saveToStorage = function(eventid, eventdata) {
	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return;
	}

	window.sessionStorage.setItem("recorder.max", eventid);
	window.sessionStorage.setItem('recorder.eventId.' + eventid, eventdata);
}

/**
 * Clear session storage
 */
jsflight.clearStorage = function() {
	jsflight.eventId = 0;
	sessionStorage.clear();
}

/**
 * Generate browser window/tab uuid
 * 
 * @returns {String}
 */
jsflight.guid = function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
			+ s4() + s4();
}

/**
 * Process mouse event
 */
jsflight.TrackMouse = function(mouseEvent) {
	if (mouseEvent.type == 'mousemove' && jsflight.options.trackMouse == false) {
		return;
	}
	if (mouseEvent.target && mouseEvent.target.id) {
		// ignoring self buttons
		if (mouseEvent.target.id.indexOf("no-track-flight-cp") === 0) {
			return;
		}
	}
	var data = JSON.stringify(jsflight.getEventInfo(mouseEvent));
	jsflight.saveToStorage(jsflight.eventId, data);
	// console.log("Event: " + data + "\n");
	jsflight.eventId++;
};

/**
 * Process keyboard event
 */
jsflight.TrackKeyboard = function(keyboardEvent) {
	// ignoring self activation/deactivation
	if (event.ctrlKey && event.altKey && event.shiftKey
			&& (event.which || event.keyCode) == 38) {
		return;
	}
	if (event.ctrlKey && event.altKey && event.shiftKey
			&& (event.which || event.keyCode) == 40) {
		return;
	}
	if (keyboardEvent.target && keyboardEvent.target.id) {
		// ignoring self buttons
		if (keyboardEvent.target.id.indexOf("no-track-flight-cp") === 0) {
			return;
		}
	}

	var data = JSON.stringify(jsflight.getEventInfo(keyboardEvent));
	jsflight.saveToStorage(jsflight.eventId, data);
	// console.log("Event: " + data + "\n");
	jsflight.eventId++;
};

jsflight.TrackHash = function(event) {
	if (jsflight.options.trackHash != true)
		return;

	var data = JSON.stringify(jsflight.getEventInfo(event));
	jsflight.saveToStorage(jsflight.eventId, data);
	// console.log("Event: " + data + "\n");
	jsflight.eventId++;
}

jsflight.TrackXhrOpen = function(data) {
	data.type = "xhr";
	data.call = "open";
	data.tabuuid = jsflight.tabUuid;
	data.url = window.location.href;
	data.timestamp = new Date().getTime()
	jsflight.saveToStorage(jsflight.eventId, JSON.stringify(data));
	jsflight.eventId++;
}

jsflight.TrackXhrSend = function(data) {
	var senddata = {
		method : data.open.method,
		target : data.open.target,
		async : data.open.async,
		user : data.open.user,
		password : data.open.password,
		request : data.data,
		sended : data.data.length
	}
	senddata.type = "xhr";
	senddata.call = "send";
	senddata.tabuuid = jsflight.tabUuid;
	senddata.url = window.location.href;
	senddata.timestamp = new Date().getTime()
	jsflight.saveToStorage(jsflight.eventId, JSON.stringify(senddata));
	jsflight.eventId++;
}

jsflight.TrackXhrStateLoad = function(xhr) {
	var data = {
		method : xhr.currentTarget.openData.method,
		target : xhr.currentTarget.openData.target,
		async : xhr.currentTarget.openData.async,
		user : xhr.currentTarget.openData.user,
		password : xhr.currentTarget.openData.password,
		loaded : xhr.loaded,
		status : xhr.currentTarget.status,
		response : xhr.currentTarget.response
	}
	data.type = "xhr";
	data.call = "load";
	data.tabuuid = jsflight.tabUuid;
	data.url = window.location.href;
	data.timestamp = new Date().getTime()
	jsflight.saveToStorage(jsflight.eventId, JSON.stringify(data));
	jsflight.eventId++;
}

/**
 * Start recorder
 * 
 * @returns {Boolean}
 */
jsflight.startRecorder = function() {
	if (document.addEventListener) {
		document.addEventListener('mousedown', jsflight.TrackMouse);
		document.addEventListener('mousemove', jsflight.TrackMouse);
		document.addEventListener('keypress', jsflight.TrackKeyboard);
		document.addEventListener('keyup', jsflight.TrackKeyboard);
		window.addEventListener('hashchange', jsflight.TrackHash);
	} else {
		document.attachEvent('mousedown', jsflight.TrackMouse);
		document.attachEvent('mousemove', jsflight.TrackMouse);
		document.attachEvent('keypress', jsflight.TrackKeyboard);
		document.attachEvent('keyup', jsflight.TrackKeyboard);
		window.attachEvent('hashchange', jsflight.TrackHash);
	}
	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return false;
	}

	window.sessionStorage.setItem('recorder.active', 'true');
	jsflight.eventId = +window.sessionStorage.getItem('recorder.max') + 1;
	if (!jsflight.eventId) {
		jsflight.eventId = 0;
	}

	if (jsflight.options.trackXhr) {
		jsflight.initXhrTracking();
	}
}

/**
 * Stop recorder
 * 
 * @returns {Boolean}
 */
jsflight.stopRecorder = function() {
	if (document.removeEventListener) {
		document.removeEventListener('mousedown', jsflight.TrackMouse);
		document.removeEventListener('mousemove', jsflight.TrackMouse);
		document.removeEventListener('keypress', jsflight.TrackKeyboard);
		document.removeEventListener('keyup', jsflight.TrackKeyboard);
		window.removeEventListener('hashchange', jsflight.TrackHash);
	} else {
		document.detachEvent('mousedown', jsflight.TrackMouse);
		document.detachEvent('mousemove', jsflight.TrackMouse);
		document.detachEvent('keypress', jsflight.TrackKeyboard);
		document.detachEvent('keyup', jsflight.TrackKeyboard);
		window.detachEvent('hashchange', jsflight.TrackHash);
	}

	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return false;
	}

	window.sessionStorage.removeItem('recorder.active');

	if (jsflight.options.trackXhr) {
		jsflight.stopXhrTracking();
	}
}

/**
 * Convert all event to json
 * 
 * @returns
 */
jsflight.getEventsAsString = function() {
	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return;
	}
	var storage = window.sessionStorage;

	var events = [];
	for ( var key in storage) {
		if (key.indexOf('recorder.eventId.') === 0) {
			events.push(storage.getItem(key));
		}
	}

	return JSON.stringify(events)
}

/**
 * method to show/hide control panel
 * 
 * @param event
 */
jsflight.controlHook = function(event) {
	if (event.ctrlKey && event.altKey && event.shiftKey
			&& (event.which || event.keyCode) == 38) {
		var panel = document.getElementById("flight-cp");
		panel.style.display = 'block';
	}
	if (event.ctrlKey && event.altKey && event.shiftKey
			&& (event.which || event.keyCode) == 40) {
		var panel = document.getElementById("flight-cp");
		panel.style.display = 'none';
	}
}

/**
 * Will recording be continued in case of page reload
 * 
 * @returns {Boolean}
 */
jsflight.shouldStartOnLoad = function() {

	if (jsflight.options.autostart == true) {
		return true;
	}

	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return false;
	}

	if (window.sessionStorage.getItem('recorder.active')) {
		return true;
	}

	return false
}

/**
 * Inject control panel specific js-code and markup
 */
jsflight.addControlHook = function() {
	jsflight.tabUuid = jsflight.guid();

	var script = document.createElement('script')
	script.type = 'text/javascript';
	script.charset = 'utf-8';
	
	//document.getElementById("data").value = jsflight.getEventsAsString();\

	script.text = ' \
		function flight_hide(){ \
	        var panel = document.getElementById("flight-cp"); \
	        panel.style.display="none"; \
		}\
		function flight_getEvents(){ \
			document.getElementById("data").value = jsflight.getEventsAsString(); \
        	return true; \
	    } \
		function flight_store(){ \
			jsflight.sendEventData(); \
		} \
	    function flight_start(){ \
			flight_hide(); \
	    	jsflight.startRecorder(); \
	    } \
	    function flight_stop(){ \
	        jsflight.stopRecorder(); \
	    } \
	    function flight_clear(){ \
			jsflight.stopRecorder(); \
	        jsflight.clearStorage(); \
	    }';
	document.body.appendChild(script);

	var css = document.createElement('style');
	css.type = 'text/css';

	var styles = '.modalDialog {position: fixed; font-family: Arial, Helvetica, sans-serif; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0, 0, 0, 0.8); z-index: 99999; -webkit-transition: opacity 400ms ease-in; -moz-transition: opacity 400ms ease-in; transition: opacity 400ms ease-in; } .modalDialog:target {opacity:1; } .modalDialog > div {width: 400px; position: relative; margin: 10% auto; padding: 5px 20px 13px 20px; border-radius: 10px; background: #fff; background: -moz-linear-gradient(#fff, #999); background: -webkit-linear-gradient(#fff, #999); background: -o-linear-gradient(#fff, #999); } .close {background: #606061; color: #FFFFFF; line-height: 25px; position: absolute; right: -12px; text-align: center; top: -10px; width: 24px; text-decoration: none; font-weight: bold; -webkit-border-radius: 12px; -moz-border-radius: 12px; border-radius: 12px; -moz-box-shadow: 1px 1px 3px #000; -webkit-box-shadow: 1px 1px 3px #000; box-shadow: 1px 1px 3px #000; } .close:hover {background: #00d9ff; }';

	if (css.styleSheet)
		css.styleSheet.cssText = styles;
	else
		css.appendChild(document.createTextNode(styles));

	document.getElementsByTagName("head")[0].appendChild(css);

	var div = document.createElement("div");
	div.id = "flight-cp";
	div.className = "modalDialog";
	div.style.display = 'none';

	div.innerHTML = '<div> \
		   <h1>JSFlight</h1><h2>Control panel</h2> \
		   <form action="'
			+ jsflight.options.baseUrl
			+ jsflight.options.downloadPath
			+ '?download" method="post" target="_blank"> \
		       <input id="data" type="hidden" value="secret" name="data"/> \
		       <input type="submit" value="Download recording" onclick="flight_getEvents()"/> \
		   </form>\
	        <button id="no-track-flight-cp1" onclick="flight_start()">Start</button> \
	        <button id="no-track-flight-cp2" onclick="flight_stop()">Stop</button> \
	        <button id="no-track-flight-cp0" onclick="flight_store()">Store</button> \
	        <button id="no-track-flight-cp3" onclick="flight_clear()">Clear</button> \
	        <button id="no-track-flight-cp4" onclick="flight_hide()">Hide</button> \
	        <button id="no-track-flight-cp5" onclick="window.open(\''
			+ jsflight.options.baseUrl
			+ jsflight.options.statusPath
			+ '\', \'_blank\')">Status</button> \
			<button id="no-track-flight-cp6" onclick="jsflight.options.trackMouse=true;">Track Move</button> \
			<button id="no-track-flight-cp7" onclick="jsflight.options.trackMouse=false">Dont Track Move</button> \
			<h6><a href="https://github.com/d0k1/jsflight">https://github.com/d0k1/jsflight</a></h6> \
			</div>';

	document.body.appendChild(div);

	if (document.addEventListener) {
		document.addEventListener('keyup', jsflight.controlHook);
	} else {
		document.attachEvent('keyup', jsflight.controlHook);
	}

	if (jsflight.shouldStartOnLoad()) {
		jsflight.startRecorder();
	}
}

/**
 * Clean up when tab is closing
 */
jsflight.removeControlHook = function() {
	if (document.removeEventListener) {
		document.removeEventListener('keyup', jsflight.controlHook);
	} else {
		document.detachEvent('keyup', jsflight.controlHook);
	}
}

/**
 * Init method. should be called on host page. uses onload and onbeforeunload
 * mechanics to add/remove event listeners
 * 
 * @param trackMouseMove
 */
jsflight.addJSFlightHooksOnDocumentLoad = function(options) {

	if (options.baseUrl)
		jsflight.options.baseUrl = options.baseUrl;

	if (options.downloadPath)
		jsflight.options.downloadPath = options.downloadPath;

	if (options.statusPath)
		jsflight.options.statusPath = options.statusPath;

	if (options.trackMouse)
		jsflight.options.trackMouse = options.trackMouse;

	if (options.trackHash)
		jsflight.options.trackHash = options.trackHash;

	if (options.trackXhr)
		jsflight.options.trackXhr = options.trackXhr;

	if (options.propertyProvider)
		jsflight.options.propertyProvider = options.propertyProvider;

	window.onload = function() {
		jsflight.addControlHook();
	}

	window.onbeforeunload = function() {
		jsflight.removeControlHook();
	};
}

jsflight.initXhrTracking = function() {
	XMLHttpRequest.prototype.oldOpen = XMLHttpRequest.prototype.open;

	var newOpen = function(method, url, async, user, password) {
		var data = {
			method : method,
			target : url,
			async : async,
			user : user,
			password : password
		};
		// skip open to ourself url
		if(url!=jsflight.options.baseUrl+jsflight.options.downloadPath) {
			jsflight.TrackXhrOpen(data);
		}
		this.openData = data;
		this.oldOpen(method, url, async, user, password);
	}

	XMLHttpRequest.prototype.open = newOpen;

	XMLHttpRequest.prototype.oldSend = XMLHttpRequest.prototype.send
	XMLHttpRequest.prototype.send = function(data) {
		if (document.addEventListener) {
			this.addEventListener("load", jsflight.TrackXhrStateLoad, false);
		} else {
			this.attachEvent("load", jsflight.TrackXhrStateLoad, false)
		}
		var trackData = {
			open : this.openData,
			data : data
		};
		// skip send to ourself url
		if(trackData.open.target!=jsflight.options.baseUrl+jsflight.options.downloadPath) {
			jsflight.TrackXhrSend(trackData);
		}
		this.oldSend.call(this, data);
	}
}

jsflight.stopXhrTracking = function() {
	XMLHttpRequest.prototype.open = XMLHttpRequest.prototype.oldOpen;
	XMLHttpRequest.prototype.oldOpen = null;

	XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.oldSend;
	XMLHttpRequest.prototype.oldSend = null;
}

jsflight.sendEventData = function(){

	if (typeof (window.sessionStorage) == "undefined") {
		console.log('No support of window.sessionStorage');
		return;
	}
	var storage = window.sessionStorage;

	var events = [];
	var keys = [];
	for ( var key in storage) {
		if (key.indexOf('recorder.eventId.') === 0) {
			events.push(storage.getItem(key));
			keys.push(key);
		}
	}
	var data = JSON.stringify(events);
	
	var xhr = new XMLHttpRequest();
	xhr.open('POST', jsflight.options.baseUrl+jsflight.options.downloadPath, true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.onload = function () {
		if(xhr.status==200){
			for ( var key in keys) {
				storage.removeItem(key);
			}
		} else {
			console.log("error storing data. status " +xhr.status)
		}
	};
	xhr.send('data='+data);	
}