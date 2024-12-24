function Label(name, textColor, bgColor){
	this.name = name;
	this.textColor = textColor;
	this.bgColor = bgColor;
	let textMetrics = c.measureText(name);
	this.w = textMetrics.width;
	this.h = textMetrics.fontBoundingBoxDescent;
	this.id = globalID;
	globalID++;
}
Label.prototype.display = function(){
	c.fillStyle = this.bgColor;
	c.fillRect(this.X, this.Y, this.w, this.h);
	c.fillStyle = this.textColor;
	c.fillText(this.name, this.X, this.Y);
	if(recording){
		if(recording[0] == this){
			c.fillStyle = "#ff880055";
			c.fillRect(this.X, this.Y, this.w, this.h);
		}else for(let i = 1; i < recording.length; i++) if(recording[i] == this){
			c.fillStyle = "#00ff0055";
			c.fillRect(this.X, this.Y, this.w, this.h);
		}
	}else if(this == selected){
		c.fillStyle = "#ffff0055";
		c.fillRect(this.X, this.Y, this.w, this.h);
	}
};
Label.prototype.updatePositioning = function(x, y){
	this.X = this.x+x;
	this.Y = this.y+y;
};
Label.prototype.move = function(newX, newY){
	this.x = newX;
	this.y = newY;
	this.reinsert();
};
Label.prototype.reinsert = function(){
	if(!this.parent) return;
	this.parent.remove(this.parent.getIndexById(this.id));
	this.parent.insert(this, this.x, this.y);
};
Label.prototype.isDescendent = function(item){
	let ancestor = this;
	while(ancestor){
		if(ancestor == item) return true;
		ancestor = ancestor.parent;
	}
	return false;
};
Label.prototype.removeSelf = function(){
	this.parent.remove(this.parent.getIndexById(this.id));
};
Label.prototype.insert = function(){
	alert("cannot insert into label.");
};
Label.prototype.rename = function(name){
	this.name = name;
	let textMetrics = c.measureText(name);
	this.w = textMetrics.width;
	this.h = textMetrics.fontBoundingBoxDescent;
	this.reinsert();
}
Label.prototype.duplicate = function(){
	return new Label(this.name, this.textColor, this.bgColor);
};
Label.prototype.equivalence = function(other){
	return this.name==other.name;
};
Label.prototype.findSelected = function(x, y){
	if(!inRect(this.X, this.Y, this.w, this.h, x, y)) return false;
	return this;
};