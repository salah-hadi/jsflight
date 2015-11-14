<html>
<head>
    <script src="jsflight/recorder" type="text/javascript"></script>
    <script>    
    /*
		jsflight.options = {
		        baseUrl:'',
		        downloadPath:'/jsflight/recorder/download',
		        statusPath:'/jsflight/recorder/status',
		        trackMouse:false,
		        trackHash:false,
		        trackXhr:false,
		        propertyProvider: function(prop){}
		}
    */
    jsflight.addJSFlightHooksOnDocumentLoad({
    	baseUrl:'<%=request.getContextPath()%>',
    	trackHash:true,
    	trackXhr:true,
    	propertyProvider:function(prop){
    		prop['customProp'] = (new Date()).getTime();
    	}
    	}, false)
    //    startRecorder();  
    </script>
    <script>
	    function loadXMLDoc(url) {
	    	  var xmlhttp;
	    	    
	    	   if (window.XMLHttpRequest) {
	    	    xmlhttp=new XMLHttpRequest();
	    	  }
	    	  else {
	    	    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	    	  }
	    	    
	    	  xmlhttp.onreadystatechange=function() {
	    	    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
	    	        //document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
	    	    }
	    	  }
	    	  xmlhttp.open("GET", url,true);
	    	  xmlhttp.send("this is request body");
	    	}
    </script>
</head>
<body>
    <form id="test">
        <input id="btn1" type="button" value="b0"/>
        <div id="d1">123</div>
        <input id="btn2" type="button" value="b1"/> 
        <button onclick="loadXMLDoc('<%=request.getContextPath()%>')">XHR ok</button>
        <button onclick="loadXMLDoc('<%=request.getContextPath()%>/12/2/12/3')">XHR 404</button>
    </form>
    <a href='#testHash'>testHash</a>
</body>
</html>