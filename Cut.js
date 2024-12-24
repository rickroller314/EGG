function Cut(w, h){
	this.w = w;
	this.h = h;
	this.children = [];
	this.id = globalID;
	globalID++;
};
Cut.prototype.display = function(){
	c.strokeStyle = "#000000";
	c.fillStyle = "#aaaaaa";
	if(this.even) c.fillStyle = "#ffffff";
	c.lineWidth = 1;
	c.fillRect(this.X, this.Y, this.w, this.h);
	c.strokeRect(this.X, this.Y, this.w, this.h);
	for(let i = 0; i < this.children.length; i++){
		if(!this.children.children) this.children[i].display();
	}
	for(let i = 0; i < this.children.length; i++){
		if(this.children.children) this.children[i].display();
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
Cut.prototype.remove = function(i){
	this.children.splice(i, 1);
};
Cut.prototype.insert = function(structure, x, y){
	x = x<margin?margin:x;
	y = y<margin?margin:y;
	// set the structure's relative coordinates
	structure.x = x;
	structure.y = y;
	structure.X = this.X+x;
	structure.Y = this.Y+y;
	structure.parent = this;
	// expand the current box down and to the right to make room
	if(this.w < structure.x+structure.w){
		this.w = structure.x+structure.w+margin;
	}
	if(this.h < structure.y+structure.h){
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
	if(this.parent){
		this.parent.remove(this.parent.getIndexById(this.id));
		this.parent.insert(this, this.x, this.y);
	}
};
Cut.prototype.getIndexById = function(id){
	for(let i = 0; i < this.children.length; i++){
		if(this.children[i].id == id) return i;
	}
	return -1;
};
Cut.prototype.duplicate = function(destination){
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