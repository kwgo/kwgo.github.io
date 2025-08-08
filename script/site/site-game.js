
this._element = function(id) {
	if(document.getElementById) {
		return document.getElementById(id);
	}
	else if(window[id]) {
		return window[id];
	}
	return null;
}
this._mousedown = function(ev) {
	var button = ev.button > 4 ? ev.button-4:ev.button;
	if(button != 0 && button != 1 && button != 2) return false;
	var el = ev.target||ev.srcElement;
	if(ev.type == "mousedown") this.box.mousedown = 1;
	if(this.box.mousedown != 1) return false;
	if(this.box.run == 1) return false;
	this.box.pressMode = button == 2 ? 2 : 0;
	if(this.box.pressMode == 0) {
		this.box.pressTimer = setTimeout(function() { this.box.pressMode = 1; _mouseup(ev); }, 400);
	}
	return false;
}

this._mouseup = function(ev) {
	clearTimeout(this.box.pressTimer);
	if(this.box.pressMode >= 0) {
		var el = ev.target||ev.srcElement;
		_mapmark(0);
		if(this.box.pressMode == 1 || this.box.pressMode == 2) this.box.run = _mappush(el.x, el.y) ? 0:-1;
		else this.box.run = _mapwalk(el.x, el.y) ? 0:-1;
		if(this.box.run == 0) {
			_mapmake(el.x, el.y);
			if(this.box.pressMode == 1 || this.box.pressMode == 2) _setblock(el.x, el.y, 999);
		}
		_mapmark(1);
	}
	this.box.mousedown = 0;
	this.box.pressMode = -1;
	_mapmark(-1);
	if(this.box.run == 0) setTimeout("_runauto()", 50);
}

this._touchstart = function(ev) {
	ev.preventDefault();
	if(this.box.run == 1) return false;
	this.box.pressMode = 0;
	this.box.pressTimer = setTimeout(function() { this.box.pressMode = 1; _mouseup(ev); }, 400);
}

this._touchend = function(ev) {
	ev.preventDefault();
	_mouseup(ev);
}

this._manauto = function() {
	var x = _getman_x();
	var y = _getman_y();
	for(var step=0; step<4; step++) {
		var tx = step==0?-1:(step==2?+1:0);
		var ty = step==1?-1:(step==3?+1:0);
		if(_getblock(x+tx, y+ty) < 1000) continue;
		_setblock(x+tx, y+ty, -100);
		x = x+tx; y = y+ty;
		if(_manmove(tx, ty)) this.box.history = this.box.counter;
		break;
	}
	if(step == 4) {  return true; }
	return false;
}
this._runauto = function() {
	if(this.box.run == 0) if(_manauto()) { this.box.run = -1; this._settitle(); } else setTimeout("_runauto()", 50);
}

this._mapmake = function(ox, oy) {
	var block = _getblock(ox, oy);
	if(block >= 0) _setblock(ox, oy, block+1000);
	var x = ox, y = oy;
	while(true) {
		for(var step=0; step<4; step++) {
			var tx = step==0?-1:(step==2?+1:0);
			var ty = step==1?-1:(step==3?+1:0);
			if(_getblock(x+tx, y+ty) < 0 || _getblock(x+tx, y+ty) != block-1) continue;
			block--;
			_setblock(x+tx, y+ty, block+1000);
			x = x+tx; y = y+ty;
			break;
		}
		if(step == 4) break;
	}			
}
this._mapmark = function(flag) {
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			if(flag == -1) _setmark(x,y,'');
			else if(_getblock(x, y) >= 1000-1) if(flag==1) _setmark(x,y,'*'); else _setmark(x,y,'');
		}
	}
}
this._mapwalk = function(ox, oy) {
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			var current = _getvalue(x, y);
			if(current == 3 || current == 4) _setblock(x, y, -1);
			else _setblock(x, y, -99);
		}
	}
	if(_getblock(ox, oy) != -1) return false;
	var xy = new Array();
	xy[0] = new Array(0, 0, 0);
	xy[0][0] = _getman_x(); xy[0][1] = _getman_y(); xy[0][2] = 0;
	var each = 0, count = 0;
	for(each=0; each <= count; each ++) {
		var x = xy[each][0], y = xy[each][1], z = xy[each][2];
		for(var step=0; step<4; step++) {
			var tx = step==0?-1:(step==2?+1:0);
			var ty = step==1?-1:(step==3?+1:0);
			if(_getblock(x+tx, y+ty) == -1) {
				count++;
				xy[count] = new Array(0, 0, 0);
				xy[count][0] = x+tx; xy[count][1] = y+ty; xy[count][2] = z+1;
				_setblock(x+tx, y+ty, z);
				if(x+tx == ox && y+ty == oy) return true;
			}
		}
	}
	return false;

}
this._mappush = function(ox, oy) {
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			var current = _getvalue(x, y);
			if(current == 3 || current == 4) _setblock(x, y, -1);
			else if(current == 2 || current == 5) _setblock(x, y, -2);
			else _setblock(x, y, -99);
		}
	}
	if(_getblock(ox, oy) != -1) return false;
	var tx = 0, ty = 0;
	if(ox == _getman_x()) ty = oy>_getman_y()?1:-1;
	else if(oy == _getman_y()) tx = ox>_getman_x()?1:-1;
	else return false;
	var count = 0;
	for(var xy=0; xy<((ox-_getman_x())*tx+(oy-_getman_y())*ty); xy++) {
		var block = _getblock(_getman_x()+(xy+1)*tx, _getman_y()+(xy+1)*ty);
		if(block !== -1 && block != -2) return false;
		if(block == -2) { count++; if(block>1) return false; }
		_setblock(_getman_x()+(xy+1)*tx, _getman_y()+(xy+1)*ty, xy); 
	}
	if(count != 1) return false;
	return true;
}
this._keydown = function(ev) {
	ev.returnValue = false;
	if(ev.keyCode == 8) {
		if(_manback(tx, ty));
		this._settitle();
		return;
	}
	if(ev.keyCode < 37 || ev.keyCode > 40) { if(this.box.keypress) this.box.keypress(ev); return false; };
	var step = step = ev.keyCode - 37;
	var tx = step==0?-1:(step==2?+1:0);
	var ty = step==1?-1:(step==3?+1:0);
	if(_manmove(tx, ty)) this.box.history = this.box.counter;
	this._settitle();
}
this._manback = function() {
	if(this.box.counter == 0) return false;
	this.box.counter--;
	var push = this.box.steps[this.box.counter]>=4?true:false;
	var step = this.box.steps[this.box.counter]%4;
	var tx = step==0?-1:(step==2?+1:0);
	var ty = step==1?-1:(step==3?+1:0);
	_setstatus(push, tx, ty);
	var x = _getman_x();
	var y = _getman_y();
	var current = _getvalue(x, y);
	var first = _getvalue(x-tx, y-ty);
	var second = _getvalue(x+tx, y+ty);
	if(first == 3) _setvalue(x-tx, y-ty, 6);
	else if(first == 4) _setvalue(x-tx, y-ty, 7);
	if(current == 6) if(push) _setvalue(x, y, 2); else _setvalue(x, y, 3);
	else if(current == 7) if(push) _setvalue(x, y, 5); else _setvalue(x, y, 4);
	if(push) if(second == 2) _setvalue(x+tx, y+ty, 3); else if(second == 5) _setvalue(x+tx, y+ty, 4);
	if(push) this.box.pusher--;
	return true;
}
this._manmove = function(tx, ty) {
	var x = _getman_x();
	var y = _getman_y();
	var push = false;
	var current = _getvalue(x, y);
	var first = _getvalue(x+tx, y+ty);
	var second = _getvalue(x+tx+tx, y+ty+ty);
	_setstatus(push, tx, ty);
	if(first == 2 || first == 5) {
		if(second != 3 && second != 4) return false;
		push = true;
		_setstatus(push, tx, ty);
		if(second == 3) _setvalue(x+tx+tx, y+ty+ty, 2);
		else if(second == 4) _setvalue(x+tx+tx, y+ty+ty, 5);
		if(first == 2) _setvalue(x+tx, y+ty, 6);
		else if(first == 5) _setvalue(x+tx, y+ty, 7);
	}
	else if(first == 3) _setvalue(x+tx, y+ty, 6);
	else if(first == 4) _setvalue(x+tx, y+ty, 7);
	else return false;
	if(current== 6) _setvalue(x, y, 3);
	else if(current == 7) _setvalue(x, y, 4);
	this.box.steps[this.box.counter] = tx<0?0:(ty<0?1:(tx>0?2:3));
	this.box.steps[this.box.counter] += push?4:0;
	if(!push) this.box.rester =  this.box.counter;
	if(push) this.box.pusher++;
	this.box.counter++;
	
	this._success();
	return true;
}
this._success = function() {
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			var current = _getvalue(x, y);
			if (current == 2 || current == 4) return false;
		}
	}
	if(this.box.success) this.box.success();
	return true;
}
this._manstep = function() {
	if(this.box.counter == this.box.history) return false;
	var step = this.box.steps[this.box.counter]%4;
	var tx = step==0?-1:(step==2?+1:0);
	var ty = step==1?-1:(step==3?+1:0);
	return _manmove(tx, ty);
}
this._rewind = function(onestep) {
	if(onestep) _manback();
	else for(i=this.box.counter; i>0; i--) _manback();
	_settitle();
}
this._forward = function(onestep) {
	if(onestep) _manstep();
	else for(i=this.box.counter; i<this.box.history; i++) _manstep();
	_settitle();
}
this._toward = function(what) {
	switch(what) {
		case -1: _manback(); break;
		case 0:  _manmove(-1,0); break;
		case 1: _manmove(0,-1); break;
		case 2: _manmove(1,0); break;
		case 3: _manmove(0,1); break;
	}
	_settitle();
}
this._getman_x = function() {
	return this.box.man[0];
}
this._getman_y = function() {
	return this.box.man[1];
}
this._setman_x = function(x) {
	this.box.man[0] = x;
}
this._setman_y = function(y) {
	this.box.man[1] = y;
}
this._setstatus = function(push, tx, ty) {
	this.box.push = push;
	this.box.tx= tx;
	this.box.ty = ty;
}
this._setvalue = function(x, y, value) {
	if(x < 0 || x >=  this.box.x || y < 0 || y >= this.box.y) return;
	var el = this.box.tb.rows[y].cells[x];
	el._value = value;
	if(value == 6 || value == 7) { _setman_x(x); _setman_y(y); }
	if(this.box.nonedisplay == 1) return;
	if(value == 0) el.style.backgroundImage = "";
	else {
		if(value == 6 || value == 7) {
			value = 9;
			if(this.box.tx == -1) value = 7; else if(this.box.tx == 1) value = 6;	
			if(this.box.ty == -1) value = 9; else if(this.box.ty == 1) value = 8;	
			if(this.box.push) value += 4;
		}
		el.style.backgroundImage = "url("+this.box.images[value].src+")";
	}
}
this._getvalue = function(x, y) {
	if(x < 0 || x >=  this.box.x || y < 0 || y >= this.box.y) return 0;
	return this.box.tb.rows[y].cells[x]._value;
}
this._setblock = function(x, y, value) {
	if(x < 0 || x >=  this.box.x || y < 0 || y >= this.box.y) return;
	this.box.tb.rows[y].cells[x]._block = value;
}
this._getblock = function(x, y) {
	if(x < 0 || x >=  this.box.x || y < 0 || y >= this.box.y) return -1;
	return this.box.tb.rows[y].cells[x]._block;
}
this._setmark = function(x, y, value) {
//	if(x < 0 || x >=  this.box.x || y < 0 || y >= this.box.y) return;
//	this.box.tb.rows[y].cells[x].style.display="block";
//	this.box.tb.rows[y].cells[x].innerText = value;
}
this._getsteps = function() {
	var steps = "";
	for(i=0; i<this.box.counter; i++) {
		steps += this.box.steps[i];
	}
	return steps;
}
this._setsteps = function(steps) {
	for(i=0; i<steps.length; i++) {
		this.box.steps[i] =  parseInt(steps.charAt(i));
	}
	this.box.history = steps.length;
}
this._settitle = function() {
	if(this.box.bar == null) return;
	if(this.box.nonedisplay == 1) return;
	var title = "";
	if(this.box.level=="*") {
//		title = " Steps:"+this.box.counter + "  ";
//		this.box.title = title;
	}
	else {
		var level = parseInt(this.box.level);
		if(isNaN(level)) return;
		title += "Level: "+(level+1)+"  Move: "+this.box.counter + "  Push: "+this.box.pusher + "  ";
//		if(document.all) this.box.bar.innerText = title;
//		else if(this.box.bar.textContent) this.box.bar.textContent = title; else this.box.title = title;
		this.box.bar.innerHTML = title;
	}
}
this._redraw = function() {
	this.box.nonedisplay = 0;
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			_setvalue(x, y, this.box.tb.rows[y].cells[x]._value);
		}
	}
	_settitle();
}
this._relay = function() {
	this.box.images = new Array();
	for(var x=0; x<14; x++) {
		this.box.images[x] = new Image();
		this.box.images[x].src = 'image'+'/'+'game'+'/'+'box'+x+'.jpg';
	}

	this.box.tb = document.createElement("table");
	this.box.tb.border = 0;
	this.box.tb.cellSpacing=0;
	this.box.tb.cellPadding=0; 
	this.box.tb.style.fontSize = "3pt";

	for(var y=0; y<this.box.y; y++) {
		var r = this.box.tb.insertRow(y);
		for(var x=0; x<this.box.x; x++) {
			var d = r.insertCell(x);
			d.x = x;
			d.y = y;
			d.map = this.box.map.charAt((y+this.box.range.top)*(this.box.shape.x)+(x+this.box.range.start));
			_setvalue(x, y, parseInt(d.map));
			d.style.backgroundSize = "100% 100%";
			d.style.backgroundRepeat = "no-repeat";
			d.onmousedown = new Function("e", "_mousedown(e||window.event)");
			d.onmousemove = new Function("e", "_mousedown(e||window.event)");
			d.onmouseup = new Function("e", "_mouseup(e||window.event)");
			d.ontouchstart = new Function("e", "_touchstart(e||window.event)");
			d.ontouchend = new Function("e", "_touchend(e||window.event)");
		}
	}
//	document.body.onkeydown = new Function("e", "_keydown(e||window.event)");
	this.box.parentNode.tabIndex = "1";
	this.box.parentNode.onkeydown = new Function("e", "_keydown(e||window.event)");
	this.box.tb.oncontextmenu = function() { return false };
	this.box.tb.onselectstart = function() { return false };

	if(this.box.firstChild) this.box.removeChild(this.box.firstChild);
	this.box.appendChild(this.box.tb);
	
	this._mapresize();
}
this._mapresize = function() {
	if(!this.box.clientWidth) return;
	var size = Math.floor(this.box.clientWidth/this.box.x);
	size = size <= this.box.shape.z ? size : this.box.shape.z; 
	size -= size * this.box.x + 8 > this.box.clientWidth ? 1 : 0;
	this.box.tb.style.marginTop = (size*(this.box.shape.y - this.box.y)/2 + 4) + "px";
	this.box.tb.style.marginBottom = (size*(this.box.shape.y - this.box.y)/2 + 4) + "px";
	for(var y=0; y<this.box.y; y++) {
		for(var x=0; x<this.box.x; x++) {
			var d = this.box.tb.rows[y].cells[x];
			d.style.width = size + "px";
			d.style.height = size + "px";
		}
	}
}
this._load = function(level, stage, container, title, success, keypress) {
	if(container == null) return;

	this.box = container;
	this.box.bar = title;
	this.box.level = level;
	this.box.stage = stage;
	this.box.success = success;
	this.box.keypress = keypress;

	this.box.counter = 0;
	this.box.pusher = 0;
	this.box.history = 0;
	this.box.run = -1;
	this.box.mousedown = 0;
	this.box.steps = new Array();
	this.box.man = new Array(0,0);

	this.box.rester = 0;
	this.box.nonedisplay = 0;
	
	var off = this.box.stage.indexOf("8");
	this.box.map = this.box.stage.substring(0, off);

	var state = this.box.stage.substring(off+1);
	off = state.lastIndexOf("401");
	this.box.estimate = state.substring(0, off);

	state = state.substring(off+3);
	off = state.lastIndexOf("0");
	this.box.shape = { type:2, x:0, y:0, z:0 };
	this.box.shape.type = state.substring(off+1);
	this.box.shape.x = this.box.shape.type * 8;
	this.box.shape.y = this.box.shape.type * 5;
	this.box.shape.z = 360 / this.box.shape.y;

	this.box.range = { start: this.box.shape.x, end: 0, top: this.box.shape.y, bottom: 0 };
	for(var y=0; y<this.box.shape.y; y++) {
		var wall = false;
		for(var x=0; x<this.box.shape.x; x++) {
			var value = parseInt(this.box.map.charAt(y*this.box.shape.x+x));
			if(value == 1) {
				if(x < this.box.range.start) this.box.range.start = x;
				if(x > this.box.range.end) this.box.range.end = x;
				wall = true;
			}
		}
		if(wall) {
			if(y < this.box.range.top) this.box.range.top = y;
			if(y > this.box.range.bottom) this.box.range.bottom = y;
		}
	}
	this.box.x = this.box.range.end - this.box.range.start + 1;
	this.box.y = this.box.range.bottom - this.box.range.top + 1;
	
	this._settitle();
	this._setstatus(false, 0, 0);
	this._relay();

	if(this.clue) {
		_setsteps(this.clue);
/*
		this.box.nonedisplay = 1;
		_forward(false);
		for(i=this.box.history; i>=this.box.rester; i--) _manback();
		this.box.nonedisplay = 0;
		_redraw();
*/
	}
	this.box.nonedisplay = 0;

	this.box.focus();
	window.onresize = function(event) { this._mapresize() };
}
//if(this._element('container') != null) this._load(this._element('container'), this._element('titler'));

