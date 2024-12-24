function Label(name, textColor, bgColor){
	this.name = name;
	this.textColor = textColor;
	this.bgColor = bgColor;
	this.quantifier = false;
	this.pegs = [];
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
	c.lineWidth = margin/2;
	if(this.pegs.length == 1){
		c.fillStyle = c.strokeStyle = this.pegs[0].color;
		c.fillRect(this.X-margin/2+this.w/2, this.Y+this.h, margin, margin);
		c.beginPath();
		c.moveTo(this.X+this.w/2, this.Y+this.h+margin/2);
		c.lineTo(this.pegs[0].X+margin/2, this.pegs[0].Y+margin/2);
		c.stroke();
		c.closePath();
	}
	for(let i = 0; i < this.pegs.length; i++){
		c.fillStyle = c.strokeStyle = this.pegs[i].color;
		c.fillRect(this.X+i*(this.w-margin)/(this.pegs.length-1), this.Y+this.h, margin, margin);
		c.beginPath();
		c.moveTo(this.X+i*(this.w-margin)/(this.pegs.length-1)+margin/2, this.Y+this.h+margin/2);
		c.lineTo(this.pegs[i].X+margin/2, this.pegs[i].Y+margin/2);
		c.stroke();
		c.closePath();
	}
};
Label.prototype.updatePositioning = function(x, y, level){
	this.X = this.x+x;
	this.Y = this.y+y;
	this.level = level;
};
Label.prototype.duplicate = function(){
	return new Label(this.name, this.textColor, this.bgColor);
};
Label.prototype.equivalence = function(other){
	return this.name==other.name;
};
Label.prototype.connect = function(thereExists, peg){
	let ancestor = this.parent;
	while(ancestor){
		if(ancestor === thereExists.parent){
			this.pegs[peg] = thereExists;
			return;
		}
		ancestor = ancestor.parent;
	}
	throw new Error("The label '"+this.name+"' is attempting to connect to a variable from outside its scope.");
};