function Cut(w, h){
	this.w = w<2*margin?2*margin:w;
	this.h = h<2*margin?2*margin:h;
	this.children = [];
	this.id = globalID;
	globalID++;
};
Cut.prototype.display = function(){
	c.strokeStyle = "#000000";
	c.fillStyle = "#ffffff";
	if(shading && !this.even) c.fillStyle = "#aaaaaa";
	c.lineWidth = 1;
	c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
	c.strokeRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
	if(recording){
		if(recording[0] == this){
			c.fillStyle = "#ff8800";
			c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
		}else for(let i = 1; i < recording.length; i++) if(recording[i] == this){
			c.fillStyle = "#00ff00";
			c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
		}
	}else if(recordingi1){
		if(recordingi1[0] == this){
			c.fillStyle = "#ff8800";
			c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
		}else for(let i = 1; i < recordingi1.length; i++) if(recordingi1[i] == this){
			c.fillStyle = "#00ff00";
			c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
		}

	}else if(this == selected){
		c.fillStyle = "#ffff00";
		c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
	}else if(this == prevSelected){
		c.fillStyle = "#888800";
		c.fillRoundedRect(this.X, this.Y, this.w, this.h, rounded*margin);
	}
	for(let i = 0; i < this.children.length; i++){
		this.children[i].display();
	}
};
Cut.prototype.updatePositioning = function(x, y, level){
	this.X = this.x+x;
	this.Y = this.y+y;
	this.level = level;
	this.even = (this.level%2)==0;
	for(let i = 0; i < this.children.length; i++){
		this.children[i].updatePositioning(this.X, this.Y, level+1);
	}
};
Cut.prototype.move = function(newX, newY){
	this.x = newX;
	this.y = newY;
	this.reinsert();
};
Cut.prototype.resize = function(w, h){
	let minW = margin*2;
	let minH = margin*2;
	for(let i = 0; i < this.children.length; i++){
		let child = this.children[i];
		minW = child.x+child.w+margin > minW ? child.x+child.w+margin : minW;
		minH = child.y+child.h+margin > minH ? child.y+child.h+margin : minH;
	}
	this.w = minW > w ? minW : w;
	this.h = minH > h ? minH : h;
	this.reinsert();
}
Cut.prototype.reinsert = function(){
	if(!this.parent) return;
	this.parent.remove(this.parent.getIndexById(this.id));
	this.parent.insert(this, this.x, this.y);
};
Cut.prototype.remove = function(i){
	this.children.splice(i, 1);
};
Cut.prototype.removeSelf = function(){
	this.parent.remove(this.parent.getIndexById(this.id));
};
Cut.prototype.insert = function(structure, x, y){
	x = x<margin?margin:x;
	y = y<margin?margin:y;
	// set the structure's relative and global coordinates
	structure.x = x;
	structure.y = y;
	structure.X = this.X+x;
	structure.Y = this.Y+y;
	structure.parent = this;
	// expand the current box down and to the right to make room
	if(this.w < structure.x+structure.w+margin){
		this.w = structure.x+structure.w+margin;
	}
	if(this.h < structure.y+structure.h+margin){
		this.h = structure.y+structure.h+margin;
	}
	// loop through the other children to find collisions
	let conflicts = [];
	for(let i = 0; i < this.children.length; i++){
		let child = this.children[i];
		if(checkConflict(child, structure)){
			conflicts.push(i);
		}
	}
	// remove and safely reinsert them right to left
	// first sort them left to right, then pop them from the list one by one
	conflicts.sort((a, b)=>this.children[a].x+this.children[a].w-this.children[b].x-this.children[b].w);
	for(let i = 0; i < conflicts.length; i++){
		// replace indices with global IDs so substructures can be identified after others have been removed/replaced
		conflicts[i] = this.children[conflicts[i]].id
	}
	while(conflicts.length > 0){
		// find the location of the last child in the conflict list
		let shoveIndex = this.getIndexById(conflicts[conflicts.length-1]);
		// remove the substructure and reinsert it to the right of the new structure 
		let child = this.children[shoveIndex];
		this.remove(shoveIndex);
		this.insert(child, structure.x+structure.w+margin, child.y);
		//shorten the conflict list
		conflicts.length--;
	}
	this.children.push(structure);
	this.reinsert();
};
Cut.prototype.getIndexById = function(id){
	for(let i = 0; i < this.children.length; i++){
		if(this.children[i].id == id) return i;
	}
	return -1;
};
Cut.prototype.duplicate = function(){
	let copyCut = new Cut(this.w, this.h);
	for(let i = 0; i < this.children.length; i++){
		copyCut.insert(this.children[i].duplicate(), this.children[i].x, this.children[i].y);
	}
	return copyCut;
};
Cut.prototype.equivalence = function(other){
	if(!other.children) return false;
	if(this.children.length !== other.children.length) return false;
	let usedJs = [];
	for(let i = 0; i < this.children.length; i++){
		let found = false;
		for(let j = 0; j < other.children.length; j++){
			if(usedJs[j]) continue;
			if(this.children[i].equivalence(other.children[j])){
				found = true;
				usedJs[j] = true;
				break;
			}
		}
		if(!found) return false;
	}
	return true;
};
Cut.prototype.isDescendent = function(item){
	let ancestor = this;
	while(ancestor){
		if(ancestor == item) return true;
		ancestor = ancestor.parent;
	}
	return false;
};
Cut.prototype.findSelected = function(x, y){
	if(!inRect(this.X, this.Y, this.w, this.h, x, y)) return false;
	for(let i = 0; i < this.children.length; i++){
		let test = this.children[i].findSelected(x, y);
		if(test) return test;
	}
	return this;
};