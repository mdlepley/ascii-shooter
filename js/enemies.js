function Enemy(options){
	this.health = 10;
	
	var el = document.createElement("p");
	el.className = "enemy";
	el.innerHTML = "&#123;&#91;&#58;&#58;&#93;&#125;";
	console.log(document);
	document.body.appendChild(el);
}