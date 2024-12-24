function ThereExists(color){
	this.color = color;
	this.w = margin;
	this.h = margin;
	this.id = globalID;
	globalID++;
}
ThereExists.prototype.display = function(){
	c.fillStyle = this.color;
	c.fillRect(this.X, this.Y, margin, margin);
};
ThereExists.prototype.updatePositioning = function(x, y, level){
	this.X = this.x+x;
	this.Y = this.y+y;
	this.level = level;
};
ThereExists.prototype.duplicate = function(){
	return new ThereExists();
};
ThereExists.prototype.equivalence = function(other, assumptions){
	return this.name==other.name && this.quantifier==other.quantifier;
};