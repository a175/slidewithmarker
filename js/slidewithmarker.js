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
 *  Constructor of SlideWithMarker
 *  @constructor
 */

NU.slidewithmarker.publ.clas.SlideWithMarker = function(){
    var elm,base;
    base = document.createElement("div");
    this.baseElement = base;
    base.style.position = "relative";
    base.style.width = "100%";
    base.style.height = "100%";
    base.style.overflow = "auto";
    base.style.zIndex = "1";
    base.className="slidewithmarker";
    
    this.slideLayer = new NU.slidewithmarker.priv.clas.SlideLayer();
    elm = this.slideLayer.getBaseElement();
    elm.style.zIndex = "1";    
    base.appendChild(elm);

    this.markerLayer = new NU.slidewithmarker.priv.clas.MarkerLayer();
    elm = this.markerLayer.getBaseElement();
    elm.style.zIndex = "3";
    base.appendChild(elm);


    this.actionLayer = new NU.slidewithmarker.priv.clas.ActionLayer(this);
    elm = this.actionLayer.getBaseElement();
    elm.style.zIndex = "5";
    base.appendChild(elm);

};


/** 
 *  @this {SlideWithMarker}
 *  @return The html element of main container.
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getBaseElement = function(){
    return this.baseElement;
};

/** 
 *  Set and load the url of a slide file.
 *  @this {SlideWithMarker}
 *  @todo Fix this function for PDF version.
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.loadSlideFile = function(url){
    this.slideLayer.loadSlideFile(url);
    this.fitMarkerLayerToSlideLayer();
};

/** 
 *  Change the visibility of each layer.
 *  @this {SlideWithMarker}
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
	this.is_slave_mode=false;
	this.is_master_mode=false;
	this.closeConnection();
    }
};


/** 
 *  Set the mode of pointer of ActionLayer.
 *  @this {SlideWithMarker}
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.setPointerMode = function(mode){
    this.actionLayer.setToggleMode(mode);
};

/** 
 *  Move to the first(-2), previous(-1), next(1) or final(2) page.
 *  @this {SlideWithMarker}
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
    this.markerLayer.setSize(size);
    this.actionLayer.setSize(size);
};


/** 
 *  @this {SlideWithMarker}
 *  @return the data of markers and slides to send to chat server.
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
 *  @todo fix the case when the connection is not ready. 
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.sendPresentationData = function(){
    var presentationdata;
    if(this.is_master_mode){
	presentationdata = this.getPresentationData();
	this.applyPresentationData(presentationdata);
	if(this.is_ready_to_send){
	    this.websocket.send(JSON.stringify(presentationdata));
	}else{
	    console.log("Not send");
	}
    }
};

/** 
 *  @this {SlideWithMarker}
 *  @return {function} Action Listener for onclose of websocket.
 *  @private
 *  @todo try to connect again?
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getActionOnClose = function(slidewithmarker){
    return function(event){
	slidewithmarker.websocket=null;
	slidewithmarker.is_ready_to_send=false;
    };
};

/** 
 *  @this {SlideWithMarker}
 *  @return {function} Action Listener for onmessage of websocket.
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getActionOnMessage = function(slidewithmarker){
    return function(event){
	if(slidewithmarker.is_slave_mode){
	    slidewithmarker.applyPresentationData(JSON.parse(event.data));
	}
    };
};

/** 
 *  @this {SlideWithMarker}
 *  @return {function} Action Listener for onopen of websocket.
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getActionOnConnectionOpen = function(slidewithmarker){
    return function(event){
	var requestdata;
	requestdata = {"request":{"slide":""}}
	slidewithmarker.websocket.send(JSON.stringify(requestdata));
	slidewithmarker.is_ready_to_send=true;
    };
};

/** 
 *  @this {SlideWithMarker}
 *  @return {function} Action Listener for onerror of websocket.
 *  @private
 *  @todo try to connect again?
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.getActionOnError = function(slidewithmarker){
    return function(event){
	slidewithmarker.is_ready_to_send = false;
	slidewithmarker.websocket = null;
    };
};

/**
 *  Open the websocet and set action linteners.
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.openConnection = function(){
    if(!this.websocket){
	this.is_ready_to_send = false;
	this.websocket = new WebSocket(this.chatserverurl);
	this.websocket.onopen = this.getActionOnConnectionOpen(this);
	this.websocket.onmessage = this.getActionOnMessage(this);
	this.websocket.onerror = this.getActionOnError(this);
	this.websocket.onclose = this.getActionOnClose(this);
    }
};

/**
 *  Close the websocet.
 *  @this {SlideWithMarker}
 *  @private
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.closeConnection = function(){
    if(this.websocket){
	this.websocket.close();
	this.is_ready_to_send = false;
	this.websocket = null;
    }
};

/**
 *  Set the URL of chat server.
 *  @this {SlideWithMarker}
 */

NU.slidewithmarker.publ.clas.SlideWithMarker.prototype.setChatSeverURL = function(url){
    if(this.websocket){
	this.websocket.close();
    }
    this.websocket = null;
    this.is_ready_to_send = false;
    this.chatserverurl = url;
};


/**
 *  Layer of slide.
 *  @constructor
 *  @private
 */

NU.slidewithmarker.priv.clas.SlideLayer = function(){
    var base;
    base = document.createElement("div");
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
 *  @return the html elment of the main container.
 *  @private
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};

/**
 *  Set and load the url of slide file
 *  @this {SlideLayer}
 *  @private
 *  @todo fix for the PDF version
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
 *  Set and load the new page of slide file
 *  @this {SlideLayer}
 *  @private
 *  @todo fix for the PDF version
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.setPage = function(page){
    var p;
    p = ((page + this.totalPages) % this.totalPages );
    this.current_page = p;
    this.slideElement.src=(this.slidefileurlbase+(p+1)+".png");
};

/**
 *  Set the page relatively
 *  @this {SlideLayer}
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
 *  @return the pair of width and height of current page of slide.
 *  @private
 *  @todo fix for the PDF version
 */

NU.slidewithmarker.priv.clas.SlideLayer.prototype.getPageSize = function(){
    return [this.slideElement.clientWidth,this.slideElement.clientHeight];
};

/**
 *  @this {SlideLayer}
 *  @return the data of slide to send the chat server.
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
 *  Layer of Makers
 *  @constructor
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer = function(){
    var base,elm;
    base = document.createElement("div");
    this.baseElement = base;
    base.style.position = "absolute";
    base.style.left = 0;
    base.style.top = 0;    
    base.style.width = "100%";
    base.style.height = "100%";
    base.className = "markerlayer";
    
    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.style.left = 0;
    elm.style.top = 0;    
    elm.style.width = "100%";
    elm.style.height = "5px";
    elm.className = "hruler";
    base.appendChild(elm);
    this.hruler = elm;

    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.style.left = 0;
    elm.style.top = 0;    
    elm.style.width = "5px";
    elm.style.height = "100%";
    elm.className = "vruler";
    base.appendChild(elm);
    this.vruler = elm;

    elm = document.createElement("div");
    elm.style.position = "absolute";
    elm.style.left = 0;
    elm.style.top = 0;    
    elm.style.width = "7px";
    elm.style.height = "7px";
    elm.className = "pointer";
    base.appendChild(elm);
    this.pointer = elm;

};

/**
 *  @this {MarkerLayer}
 *  @return the html elemnt of the main container.
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};

/**
 *  Set visibility.
 *  @this {MarkerLayer}
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
 *  @private
 */

NU.slidewithmarker.priv.clas.MarkerLayer.prototype.setMarker = function(markerdata,scale){
    this.vruler.style.left = markerdata["pointer"]["p"][0]*scale;
    this.hruler.style.top = markerdata["pointer"]["p"][1]*scale;
    this.pointer.style.left = markerdata["pointer"]["p"][0]*scale;
    this.pointer.style.top = markerdata["pointer"]["p"][1]*scale;
    if(markerdata["pointer"]["s"]=="o"){
	this.pointer.style.visibility = "visible";
    }else{
	this.pointer.style.visibility = "hidden";
    }
};



/**
 *  Layer for action.
 *  @constractor 
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer = function(parentcontainer){
    var base,action;
    base  = document.createElement("div");
    this.baseElement = base;
    base.style.position = "absolute";
    base.style.left = 0;
    base.style.top = 0;    
    base.style.width = "100%";
    base.style.height = "100%";    
    base.className = "actionlayer";

    this.pointer_style = "";
    this.changePointerCoordinate(0,0);
    this.toggle_mode = 0;

    
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
 *  @return the html element of the main container 
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.getBaseElement = function(){
    return this.baseElement;
};


/**
 *  @this {ActionLayer}
 *  @return the data of marker to send chat server.
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
 *  @return {function} Action Listner for onmousedown for this layer
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
 *  @return {function} Action Listner for onmouseup for this layer
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
 *  @return {function} Action Listner for onmousemove for this layer
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
 *  @return {function} Action Listner for onmouseclick for this layer
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
 *  @return {function} Action Listner for onmousedblclick for this layer
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
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.setToggleMode = function(togglemode){
    this.toggle_mode = togglemode;
    this.changePointerStyle(0);
}

/**
 *  Change the style of pointer.
 *  @this {ActionLayer}
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
 *  @private
 */

NU.slidewithmarker.priv.clas.ActionLayer.prototype.changePointerCoordinate = function(x,y){
    this.pointer_coordinate = [x,y];
};



