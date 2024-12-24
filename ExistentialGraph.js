function ExistentialGraph(can){
	this.x = this.y = this.X = this.Y = 0;
	this.w = margin*2;
	this.h = margin*2;
	this.children = [];
	this.can = can;
	this.display();
}
ExistentialGraph.prototype.insert = function(structure, x, y){
	x = x<margin?margin:x;
	y = y<margin?margin:y;
	// set the structure's relative coordinates
	structure.x = x;
	structure.y = y;
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
};
ExistentialGraph.prototype.display = function(){
	this.can.width = this.w;
	this.can.height = this.h;
	window.c = canvas.getContext("2d");
	c.textBaseline = "top";
	c.font = "40px monospace";
	this.updatePositioning();
	if(this == selected){
		c.fillStyle = "#ffff0055";
		c.fillRect(selected.X, selected.Y, selected.w, selected.h);
	}
	for(let i = 0; i < this.children.length; i++){
		this.children[i].display();
	}
};
ExistentialGraph.prototype.updatePositioning = function(){
	this.level = 0;
	this.even = true;
	for(let i = 0; i < this.children.length; i++){
		this.children[i].updatePositioning(0, 0, 1);
	}
};
ExistentialGraph.prototype.remove = function(i){
	this.children.splice(i, 1);
}
ExistentialGraph.prototype.getIndexById = function(id){
	for(let i = 0; i < this.children.length; i++){
		if(this.children[i].id == id) return i;
	}
	return -1;
};
ExistentialGraph.prototype.isDescendent = function(item){
	let ancestor = this;
	while(ancestor){
		if(ancestor == item) return true;
		ancestor = ancestor.parent;
	}
	return false;
};
ExistentialGraph.prototype.duplicate = function(){
	let copyGraph = new ExistentialGraph(this.can);
	for(let i = 0; i < this.children.length; i++){
		copyGraph.insert(this.children[i].duplicate());
	}
};
ExistentialGraph.prototype.findSelected = function(x, y){
	for(let i = 0; i < this.children.length; i++){
		let test = this.children[i].findSelected(x, y);
		if(test) return test;
	}
	return this;
};

ExistentialGraph.prototype.iterate = function(item1, item2, x, y){
	let item = item1;
	let destination = item2;
	if(destination.isDescendent(item)){
		alert("cannot insert inside of self");
		return;
	}
	if(!destination.isDescendent(item.parent)){
		alert("cannot insert outside of scope");
	}
	destination.insert(item.duplicate(), x, y);
	this.display();
}
ExistentialGraph.prototype.deiterate = function(item1, item2){
	parentItem = item1;
	childItem = item2;
	if(!parentItem.equivalence(childItem)){
		alert("not an equivalent structure");
		return;
	}
	if(parentItem.id == childItem.id){
		alert("cannot deiterate itself");
		return;
	}
	if(parentItem.level > childItem.level){
		parentItem = item2;
		childItem = item1;
	}
	if(!childItem.isDescendent(parentItem.parent)){
		alert("cannot deiterate out of scope");
		return;
	}
	childItem.removeSelf();
	this.display();
}
ExistentialGraph.prototype.insertion = function(structure, child, x, y){
	if(structure.even){
		alert("cannot insert into an even level");
		return;
	}
	structure.insert(child.duplicate(), x, y);
	this.display();
}
ExistentialGraph.prototype.erasure = function(item){
	let parent = item.parent;
	if(!parent.even){
		alert("cannot erase from an odd level");
		return;
	}
	parent.remove(parent.getIndexById(item.id));
	this.display();
}
ExistentialGraph.prototype.doubleCutInsert = function(items, scope, x, y){
	let minX = minY = Infinity;
	for(let i = 0; i < items.length; i++){
		if(items[i].parent !== scope){
			alert("not all selected items (green) are directly within the given scope (orange)");
			return;
		}
		minX = items[i].x < minX ? items[i].x : minX;
		minY = items[i].y < minY ? items[i].y : minY;
	}
	let cut1 = new Cut(0, 0);
	let cut2 = new Cut(0, 0);
	for(let i = 0; i < items.length; i++){
		cut2.insert(items[i].duplicate(), items[i].x-minX+margin, items[i].y-minY+margin);
		scope.remove(scope.getIndexById(items[i].id));
	}
	cut1.insert(cut2, 0, 0);
	if(x===undefined){
		x = minX, y = minY;
	}
	if(x===undefined){
		x = 0, y = 0;
	}
	scope.insert(cut1, x|minX, y|minY);
	this.display();
}
ExistentialGraph.prototype.doubleCutErase = function(cut){
	if(cut.children.length == 0){
		alert("cut is empty");
		return;
	}
	if(cut.children.length > 1){
		alert("the outer cut contains more than just the inner cut");
		return;
	}
	let cut2 = cut.children[0];
	if(!cut2.children){
		alert("inner object is not a cut");
		return;
	}
	let scope = cut.parent;
	scope.remove(scope.getIndexById(cut.id));
	for(let i = 0; i < cut2.children.length; i++){
		let child = cut2.children[i];
		scope.insert(child.duplicate(), child.x+cut.x, child.y+cut.y);
	}
	this.display();
}

