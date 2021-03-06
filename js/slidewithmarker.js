if(!NU){var NU={};}
NU.slidewithmarker={
    "version":"Time-stamp: <2020-06-07 08:46:42 nous>",
    "publ":{"clas":{},"func":{},"cons":{}},
    "priv":{"clas":{},"func":{},"cons":{}}
};



NU.slidewithmarker.publ.cons.SVGNS="http://www.w3.org/2000/svg";
NU.slidewithmarker.publ.cons.XLINKNS="http://www.w3.org/1999/xlink";

NU.slidewithmarker.publ.cons.TEST_SERVERURL = "ws://127.0.0.1:12345/";
NU.slidewithmarker.publ.cons.TEST_SLIDEURLBASE = "./test-data/image-";

NU.slidewithmarker.publ.func.createAndPut = function(pare){};




/** 
 *  Constructor of SlideWithMarker.
 *  This class implements the main container and frontends of functions of slide with marker.
 *  
 *  @constructor
 *  @this {SlideWithMarker}
 */

NU.slidewithmarker.publ.clas.SlideWithMarker = function(){
    var elm,base;
    base = document.createElement("div");

    /** @type {Element} The html element of the main container. */
    this.baseElement = base;
    base.style.position = "relative";
    base.style.zIndex = "1";
    base.className="slidewithmarker";
    
    /** @type {SlideLayer}*/
    this.slideLayer = new NU.slidewithmarker.priv.clas.SlideLayer();
    elm = this.slideLayer.getBaseElement();
    elm.style.zIndex = "1";    
    base.appendChild(elm);

    /** @type {MarkerLayer}*/
    this.markerLayer = new NU.slidewithmarker.priv.clas.MarkerLayer();
    elm = this.markerLayer.getBaseElement();
    elm.style.zIndex = "3";
    base.appendChild(elm);


    /** @type {ActionLayer}*/
    this.actionLayer = new NU.slidewithmarker.priv.clas.ActionLayer(this);
    elm = this.actionLayer.getBaseElement();
    elm.style.zIndex = "5";
    base.appendChild(elm);


    /** @type {Connection}*/
    this.connection = new NU.slidewithmarker.priv.clas.Connection(this);
};


/**
 *  This mehod retuens the main container of this class to add to DOM.
 *  @this {SlideWithMarker}
 *  @return {Element} The html element of main container.
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getBaseElement = function(){
    return this.baseElement;
};


/** 
 *  Set and load the url of a slide file.
 *  @this {SlideWithMarker}
 *  @param {String} url The base URL of the slide file.
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.loadSlideFile = function(url){
    this.slideLayer.loadSlideFile(url);
    this.fitMarkerLayerToSlideLayer();
};


/** 
 *  Change the visibility of each layer.
 *  @this {SlideWithMarker}
 *  @param {Number} mode  
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.setMode = function(mode){
    if(mode==3){
	this.actionLayer.setActive(true);
	this.markerLayer.setActive(true);
	this.fitMarkerLayerToSlideLayer();
	this.is_slave_mode=true;
	this.is_master_mode=true;
	this.openConnection();
    }
    if(mode==1){
	this.actionLayer.setActive(false);
	this.markerLayer.setActive(true);
	this.fitMarkerLayerToSlideLayer();
	this.is_slave_mode=true;
	this.is_master_mode=false;
	this.openConnection();
    }
    if(mode==0){
	this.actionLayer.setActive(false);
	this.markerLayer.setActive(false);
	this.fitMarkerLayerToSlideLayer();
	this.is_slave_mode=false;
	this.is_master_mode=false;
	this.closeConnection();
    }
};


/** 
 *  Set the mode of pointer of ActionLayer.
 *  @this {SlideWithMarker}
 *  @param {Number} mode
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.setPointerMode = function(mode){
    this.actionLayer.setToggleMode(mode);
};


/** 
 *  Move to the first(-2), previous(-1), next(1) or final(2) page.
 *  @this {SlideWithMarker}
 *  @param {Number} mode
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.movePage = function(mode){
    if(this.is_master_mode || !this.is_slave_mode){
	if(mode==-2){
	    this.slideLayer.setPage(0);
	}
	if(mode==-1){
	    this.slideLayer.nextPage(-1);
	}
	if(mode==1){
	    this.slideLayer.nextPage(1);
	}
	if(mode==2){
	    this.slideLayer.setPage(-1);
	}
	if(this.is_master_mode){
	    this.sendPresentationData();
	}
    }
    this.fitMarkerLayerToSlideLayer();
};


/** 
 *  Adjust the size of marker and action layers to slide layer.
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.fitMarkerLayerToSlideLayer = function(){
    var size;
    size=this.slideLayer.getPageSize();
    if(size){
	this.markerLayer.setSize(size);
	this.actionLayer.setSize(size);
	this.baseElement.style.width = size[0];
	this.baseElement.style.height = size[1];
    }
};


/** 
 *  @this {SlideWithMarker}
 *  @return {Object} The data of markers and slides to send to chat server.
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getPresentationData = function(){
    var presentationdata;
    presentationdata = {};	
    presentationdata["marker"]=this.actionLayer.getMarkerdata();
    presentationdata["slide"]=this.slideLayer.getSlidedata();
    return presentationdata;
};


/** 
 *  Apply  the data of markers and slides recieved from chat server.
 *  @this {SlideWithMarker}
 *  @param {Object} data
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.applyPresentationData = function(data){
    var s,p,slidedata,scale;
    slidedata=data["slide"];
    scale=1;
    if(slidedata){
	if(this.slideLayer.current_page != slidedata["page"]){
	    this.slideLayer.setPage(slidedata["page"]);
	}
	s=slidedata["size"][0];
	if(s){
	    p=this.slideLayer.getPageSize()[0];
	    if(p!=s){
		scale=p/s;
	    }
	}
    }
    if(data["marker"]){
	this.markerLayer.setMarker(data["marker"],scale);
    }
};


/** 
 *  Get and send the data of markers and slides to chat server. 
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.sendPresentationData = function(){
    var presentationdata;
    if(this.is_master_mode){
	presentationdata = this.getPresentationData();
	this.applyPresentationData(presentationdata);
	this.connection.send(presentationdata);
    }
};




/**
 *  Open the websocet and set action linteners.
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.openConnection = function(){
    this.connection.open();
};



/**
 *  Close the websocet.
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.closeConnection = function(){
    this.connection.close();
};



/**
 *  Set the URL of chat server.
 *  @this {SlideWithMarker}
 *  @param {String} url The url of chat server.
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.setChatSeverURL = function(url){
    this.connection.setURL(url);
};


/**
 *  Class to implement connection by websocket.
 *  @constructor
 *  @this {Connection}
 *  @private
 */

NU.slidewithmarker.priv.clas.Connection = function(slidewithmarker){
    this.is_ready_to_send=false;
    this.websocket = null;
    this.url = null;
    this.slidewithmarker = slidewithmarker;
};


/**
 *  Translate String to presentationdata
 *  @this {Connection}
 *  @private
 *  @return {Object} presentationdata to apply slidewithmarker
 */

NU.slidewithmarker.priv.clas.Connection.prototype.translateToPresentationdata = function(data){
    return JSON.parse(data);
}




/**
 *  Translate Presentation data to data for server.
 *  @this {Connection}
 *  @private
 *  @return {String} data to send to server
 */

NU.slidewithmarker.priv.clas.Connection.prototype.translateToStringData = function(data){
    return JSON.stringify(data);

}


/**
 *  Get data to send server at first.
 *  @this {Connection}
 *  @private
 *  @return {String} data to send to server
 */

NU.slidewithmarker.priv.clas.Connection.prototype.getFirstRequest = function(){
    var requestdata;
    requestdata = {"request":{"slide":""}};
    return JSON.stringify(requestdata);
}



/**
 *  Set the URL of chat server.
 *  @this {Connection}
 *  @param {String} url The url of chat server.
 */

NU.slidewithmarker.priv.clas.Connection.prototype.setURL = function(url){
    if(this.websocket){
	this.websocket.close();
    }
    this.websocket = null;
    this.is_ready_to_send = false;
    this.url = url;
};



/**
 *  Open the websocet and set action linteners.
 *  @this {Connection}
 *  @private
 */

NU.slidewithmarker.priv.clas.Connection.prototype.open = function(){
    if(!this.websocket){
	this.is_ready_to_send = false;
	this.websocket = new WebSocket(this.url);
	this.websocket.onopen = this.getActionOnConnectionOpen(this);
	this.websocket.onmessage = this.getActionOnMessage(this.slidewithmarker,this);
	this.websocket.onerror = this.getActionOnError(this);
	this.websocket.onclose = this.getActionOnClose(this);
    }
};

/**
 *  Close the websocet.
 *  @this {Connection}
 *  @private
 */

NU.slidewithmarker.priv.clas.Connection.prototype.close = function(){
    if(this.websocket){
	this.websocket.close();
	this.is_ready_to_send = false;
	this.websocket = null;
    }
};


/**
 *  Send message to the server if possible.
 *  @this {Connection}
 *  @private
 *  @todo Fix the case when the connection is not ready. 
 */

NU.slidewithmarker.priv.clas.Connection.prototype.send = function(data){
	if(this.is_ready_to_send){
	    this.websocket.send(this.translateToStringData(data));
	}else{
	    console.log("Not send");
	}
}


/** 
 *  @this {Connection}
 *  @param {Connection} connection
 *  @return {Function} Action listener for onclose of websocket.
 *  @private
 *  @todo Try to connect again?
 */

NU.slidewithmarker.priv.clas.Connection.prototype.getActionOnClose = function(connection){
    return function(event){
	connection.websocket=null;
	connection.is_ready_to_send=false;
    };
};


/** 
 *  @this {Connection}
 *  @param {SlideWithMarker} slidewithmarker
 *  @return {Function} Action listener for onmessage of websocket.
 *  @private
 */

NU.slidewithmarker.priv.clas.Connection.prototype.getActionOnMessage = function(slidewithmarker,connection){
    return function(event){
	var presentationdata;
	if(slidewithmarker.is_slave_mode){
	    presentationdata = connection.translateToPresentationdata(event.data);
	    slidewithmarker.applyPresentationData(presentationdata);
	}
    };
};


/** 
 *  @this {Connection}
 *  @param {Connection} connection
 *  @return {Function} Action listener for onopen of websocket.
 *  @private
 */
NU.slidewithmarker.priv.clas.Connection.prototype.getActionOnConnectionOpen = function(connection){
    return function(event){
	connection.websocket.send(connection.getFirstRequest());
	connection.is_ready_to_send=true;
    };
};


/** 
 *  @this {Connection}
 *  @param {Connection} connection
 *  @return {Function} Action listener for onerror of websocket.
 *  @private
 *  @todo Try to connect again?
 */

NU.slidewithmarker.priv.clas.Connection.prototype.getActionOnError = function(connection){
    return function(event){
	connection.is_ready_to_send = false;
	connection.websocket = null;
    };
};


/**
 *  Layer of slide.
 *  @constructor
 *  @this {SlideLayer}
 *  @private
 *  @todo Fix for the PDF version.
 */

NU.slidewithmarker.priv.clas.SlideLayer = function(){
    var base;
    base = document.createElement("div");

    /** @type {Element} The main container of the html element.*/
    this.baseElement = base;
    base.style.position = "absolute";
    base.style.left = 0;
    base.style.top = 0;
    base.style.width = "100%";
    base.style.height = "100%";
    base.className = "slidelayer";
};


/**
 *  @this {SlideLayer}
 *  @return {Element} The html elment of the main container.
 *  @private
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};


/**
 *  Set and load the url of slide file.
 *  @this {SlideLayer}
 *  @param {String} The url of the slide file.
 *  @private
 *  @todo Fix for the PDF version.
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.loadSlideFile = function(url){
    if (this.slideElement){
	/*this.baseElement.removeChild(this.slideElement);*/
    }else{
	this.slideElement = document.createElement("img");
	this.baseElement.appendChild(this.slideElement);
    }
    this.slidefileurlbase = url;
    this.totalPages = 4;
    this.setPage(0);
};


/**
 *  Set and load the new page of slide file.
 *  @this {SlideLayer}
 *  @param {Number} page.
 *  @private
 *  @todo Fix for the PDF version.
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.setPage = function(page){
    var p;
    p = ((page + this.totalPages) % this.totalPages );
    this.current_page = p;
    this.slideElement.src=(this.slidefileurlbase+(p+1)+".png");
};


/**
 *  Set the page relatively.
 *  @this {SlideLayer}
 *  @param {Number} The number to add the current page.
 *  @private
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.nextPage = function(page_rel){
    var p;
    p = this.current_page + page_rel;
    if( p >= 0 && p < this.totalPages){
	this.setPage(p);
    }
};


/**
 *  @this {SlideLayer}
 *  @return {Array} The pair of width and height of current page of slide.
 *  @private
 *  @todo Fix for the PDF version.
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.getPageSize = function(){
    if(this.slideElement){
	return [this.slideElement.clientWidth,this.slideElement.clientHeight];
    }
    return null;
};


/**
 *  @this {SlideLayer}
 *  @return {Obeject} The data of slide to send the chat server.
 *  @private
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.getSlidedata = function(){
    var ps, cp, data;
    ps=this.getPageSize();
    cp=this.current_page;
    data = {"size":ps,"page":cp};
    return data;
};




/**
 *  Layer of Makers.
 *  @constructor
 *  @this {MarkerLayer}
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer = function(){
    var base,elm;
    base = document.createElement("div");

    /** @type {Element} The main container of the html element.*/
    this.baseElement = base;
    base.style.position = "absolute";
    base.style.left = 0;
    base.style.top = 0;    
    base.style.width = "100%";
    base.style.height = "100%";
    base.className = "markerlayer";
    
    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.style.width = "100%";
    elm.className = "hruler";
    base.appendChild(elm);
    /** @type {Element} Horizonal ruler.*/
    this.hruler = elm;

    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.style.height = "100%";
    elm.className = "vruler";
    base.appendChild(elm);
    /** @type {Element} Virtical ruler.*/
    this.vruler = elm;

    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.className = "pointer";
    base.appendChild(elm);
    /** @type {Element} Pointer.*/
    this.pointer = elm;

    this.setMarkerPosition(0,0);
    this.setMarkerSize("1ex");
};


/**
 *  @this {MarkerLayer}
 *  @return {Element} The html elemnt of the main container.
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};


/**
 *  Set visibility.
 *  @this {MarkerLayer}
 *  @param {Boolean} isactive
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setActive = function(isactive){
    if(isactive){
	this.baseElement.style.visibility = "visible";
    }else{
	this.baseElement.style.visibility = "hidden";
    }
};


/**
 *  Set size.
 *  @this {MarkerLayer}
 *  @param {Array} size The pair of width and height.
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setSize = function(size){
    if(size){
	this.baseElement.style.width = size[0];
	this.baseElement.style.height = size[1];
    }
};


/**
 *  Set marker.
 *  @this {MarkerLayer}
 *  @param {Object} markerdata The data recieved from the chat server.
 *  @param {Number} scale 
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setMarker = function(markerdata,scale){
    var pointer, position, style, width, x, y;
    pointer = markerdata["pointer"];
    if(pointer){
	position = pointer["p"];
	if(position){
	    x = position[0]*scale;
	    y = position[1]*scale;
	    this.setMarkerPosition(x,y);
	}
	width = pointer["w"];
	if(width){
	    width = width*scale;
	    this.setMarkerSize(width);
	}
	style = pointer["s"];
	if(style=="o"){
	    this.pointer.style.visibility = "visible";
	}else{
	    this.pointer.style.visibility = "hidden";
	}
    }
};


/**
 *  Set the size of marker.
 *  @this {MarkerLayer}
 *  @param width The size of marker as Number or CSS string.
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setMarkerSize = function(width){
    this.vruler.style.width = width;
    this.hruler.style.height = width;
    this.pointer.style.width = width;
    this.pointer.style.height = width;
};


/**
 *  Set the position of marker.
 *  @this {MarkerLayer}
 *  @param {Number} x
 *  @param {Number} y
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setMarkerPosition = function(x,y){
    this.vruler.style.left = x; 
    this.hruler.style.top = y;
    this.pointer.style.left = x;
    this.pointer.style.top = y;
};




/**
 *  Layer for action.
 *  @constractor 
 *  @this {ActionLayer}
 *  @param {SlideWithMarker} parentcontainer The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer = function(parentcontainer){
    var base,action;
    base  = document.createElement("div");
    /** @type {Element} The main container of html element.*/
    this.baseElement = base;
    base.style.position = "absolute";
    base.style.left = 0;
    base.style.top = 0;    
    base.style.width = "100%";
    base.style.height = "100%";    
    base.className = "actionlayer";

    /** @type {String} The style of the pointer.
      * @private 
      */
    this.pointer_style = "";
    this.changePointerCoordinate(0,0);
    this.setToggleMode(0);
    
    action = this.getActionOnMouseDown(parentcontainer);
    this.baseElement.addEventListener("mousedown",action);
    action = this.getActionOnMouseMove(parentcontainer);
    this.baseElement.addEventListener("mousemove",action);
    action = this.getActionOnMouseUp(parentcontainer);
    this.baseElement.addEventListener("mouseup",action);
    action = this.getActionOnMouseClick(parentcontainer);
    this.baseElement.addEventListener("click",action);
    action = this.getActionOnMouseDblClick(parentcontainer);
    this.baseElement.addEventListener("dblclick",action);
};


/**
 *  @this {ActionLayer}
 *  @return {Element} The html element of the main container.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};


/**
 *  @this {ActionLayer}
 *  @return {Object} The data of marker to send chat server.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getMarkerdata = function(){
    var s, p, ps, cp, markerdata;
    s=this.pointer_style;
    p=this.pointer_coordinate;
    markerdata = {"pointer": {"p":p,"s":s}};
    return markerdata;
};


/**
 *  @this {ActionLayer}
 *  @return {Function} Action listner for onmousedown for this layer.
 *  @param {SlideWithMarker} slidewithmarker The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getActionOnMouseDown = function(slidewithmarker){
    return function(event){
	var x,y;
	slidewithmarker.actionLayer.changePointerStyle(1);
	x=event.offsetX;
	y=event.offsetY;
	slidewithmarker.actionLayer.changePointerCoordinate(x,y);
	slidewithmarker.sendPresentationData();
    };
};


/**
 *  @this {ActionLayer}
 *  @return {Function} Action listner for onmouseup for this layer.
 *  @param {SlideWithMarker} slidewithmarker The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getActionOnMouseUp = function(slidewithmarker){
    return function(event){
	var x,y;
	slidewithmarker.actionLayer.changePointerStyle(0);
	x=event.offsetX;
	y=event.offsetY;
	slidewithmarker.actionLayer.changePointerCoordinate(x,y);
	slidewithmarker.sendPresentationData();
    };
};


/**
 *  @this {ActionLayer}
 *  @return {Function} Action listner for onmousemove for this layer.
 *  @param {SlideWithMarker} slidewithmarker The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getActionOnMouseMove = function(slidewithmarker){
    return function(event){
	var x,y;
	x=event.offsetX;
	y=event.offsetY;
	slidewithmarker.actionLayer.changePointerCoordinate(x,y);
	slidewithmarker.sendPresentationData();
    };
};


/**
 *  @this {ActionLayer}
 *  @return {Function} Action listner for onmouseclick for this layer.
 *  @param {SlideWithMarker} slidewithmarker The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getActionOnMouseClick = function(slidewithmarker){
    return function(event){
	var x,y;
	slidewithmarker.actionLayer.changePointerStyle(-1);
	x=event.offsetX;
	y=event.offsetY;
	slidewithmarker.actionLayer.changePointerCoordinate(x,y);
	slidewithmarker.sendPresentationData();
    };
};


/**
 *  @this {ActionLayer}
 *  @return {Function} Action listner for onmousedblclick for this layer.
 *  @param {SlideWithMarker} slidewithmarker The parent element of this.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getActionOnMouseDblClick = function(slidewithmarker){
    return function(event){
	slidewithmarker.slideLayer.nextPage(1);
	slidewithmarker.sendPresentationData();
    };
};


/**
 *  Change the visibility.
 *  @this {ActionLayer}
 *  @param {Boolean} isactive
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.setActive = function(isactive){
    if(isactive){
	this.baseElement.style.visibility = "visible";
    }else{
	this.baseElement.style.visibility = "hidden";
    }
};


/**
 *  Set the size.
 *  @this {ActionLayer}
 *  @param {Array} size The pair of width and height.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.setSize = function(size){
    if(size){
	this.baseElement.style.width = size[0];
	this.baseElement.style.height = size[1];
    }
};


/**
 *  Set how to toggle pointer.
 *  @this {ActionLayer}
 *  @togglemode {Number} togglemode
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.setToggleMode = function(togglemode){
    this.toggle_mode = togglemode;
    this.changePointerStyle(0);
}


/**
 *  Change the style of pointer.
 *  @this {ActionLayer}
 *  @param {Number} e The kind of events. 0:mouseup, 1:mousedown, -1:mouseclick.
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.changePointerStyle = function(e){
    if(this.toggle_mode == 1){
	if(this.pointer_style==""){
	    this.pointer_style="o";
	}else{
	    this.pointer_style="";
	}
    }
    if(this.toggle_mode == 2){
	if(e==1){
	    this.pointer_style="o";
	}else{
	    if(e==0){
		this.pointer_style="";
	    }
	}
    }
    if(this.toggle_mode == -1){
	this.pointer_style="o";
    }
    if(this.toggle_mode == -2){
	this.pointer_style="";
    }    
};


/**
 *  Set pointer cordinate to send to chat server.
 *  @this {ActionLayer}
 *  @param {Number} x
 *  @param {Number} y
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.changePointerCoordinate = function(x,y){
    this.pointer_coordinate = [x,y];
};



