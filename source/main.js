var CardWeaver = (function(){
	var Ribbon = function(){
		this.width = 0;
		this.length = 0;
		this.cards = [];
		this.twists = [];
		this.strings = [];
	}
	Ribbon.prototype.newString = function(){
		var string = new String();
		this.strings.push(string);
		return string;
	}
	Ribbon.prototype.removeString = function(index){
		return this.strings.splice(index,1);
	}
	Ribbon.prototype.setWidth = function(width){
		if (this.cards.length<width){
			for(var k=width-this.cards.length; k>0; k--){
				this.addCard();
			}
		}
		else if (this.cards.length>width){
			for(var k=this.cards.length-width; k>0; k--){
				this.removeCard();
			}
		}
	}
	Ribbon.prototype.setLength = function(length){
		if (length>=this.length){
			for(var k1=0; k1<this.width; k1++){
				for(var k2=this.twists[k1].length; k2<length; k2++){
					this.twists[k1].push(this.cards[k1].threading=="s"?1:-1);
				}

			}
		}
		else if (length<this.length){
			for(var k1=0; k1<this.width; k1++){
				if (length<this.twists[k1].length){
					this.twists[k1].splice(length,this.twists[k1].length-length+1);
				}
			}
		}
		this.length = length
	}
	Ribbon.prototype.newCard = function(index){
		var card = new Card();
		if (!index){
			this.cards.push(card);
			this.twists.push(new Array());
		}
		else{
			this.cards.splice(index, 0 , card);
			this.twists.splice(index, 0 , new Array());
		}
		this.width++;
		return card;
	}
	Ribbon.prototype.removeCard = function(index){
		if (!index) index = this.width-1;
		var card = new Card();
		this.cards.splice(index, 1);
		this.twists.splice(index, 1);
		this.width--;
		return card;
	}
	Ribbon.prototype.setTwist = function(row, column, value){
		if (this.getColumnPeriod(column)-1 < row) row = getColumnPeriod(column);
		this.twists[column][row] = value;
	}
	Ribbon.prototype.swapTwist = function(row, column){
		if (this.getColumnPeriod(column)-1 < row) row = getColumnPeriod(column);
		this.twists[column][row]*=-1;
	}
	Ribbon.prototype.getColumnPeriod = function(column){
		return this.twists[column].length;
	}
	Ribbon.prototype.getCard = function(column){
		return this.cards[column];
	}
	Ribbon.prototype.getTopRowTwists = function(row){
		var values = [];
		var value;
		for(column=0; column<this.width; column++){
			if (this.cards[column].isValid()){
				value = this.twists[column][loopValue(row,this.twists[column].length-1)];
				value*=-1;
			}
			else{
				value = false;
			}
			values.push(value);
		}
		return values;
	}
	Ribbon.prototype.getRowCardPositions = function(row){
		var values = [];
		var value;
		for(column=0; column<this.width; column++){
			if (this.cards[column].isValid()){
				value = 0;
				for(k2=0;k2<row; k2++){
					value+=this.twists[column][loopValue(k2,this.twists[column].length-1)];
				}
				value = loopValue(value,this.cards[column].holes,1);
			}
			else{
				value = false;
			}
			values.push(value);
		}
		return values;
	}
	Ribbon.prototype.getTopRowStrings = function(row){
		var positions = this.getRowCardPositions(row);
		var twists = this.getTopRowTwists(row);
		var values = [];
		for(var k = 0; k<this.width; k++){
			if (positions[k]===false){
				values.push(false);
				continue;
			}
			var index = positions[k];
			if (twists[k]>0) index--;
			index = loopValue(index, this.cards[k].holes-1)
			values.push(this.cards[k].strings[index])
		}
		return values;
	}
	Ribbon.prototype.save = function(){
		var json = JSON.stringify(this);
		var data = JSON.parse(json);

		for(var k1=0; k1<this.cards.length; k1++){
			var links = [];
			for(var string of this.cards[k1].strings){
				for(var k2=0; k2<this.strings.length; k2++){
					if (this.strings[k2] === string) links.push(k2);
				}
			}
			data.cards[k1].strings = links;
		}

		var json = JSON.stringify(data);
		return json;
	}
	Ribbon.prototype.load = function(json){
		this.width = 0;
		this.cards = [];
		this.twists = [];
		this.strings = [];

		var data = JSON.parse(json);

		for(var string of data.strings){
			var s = this.newString();
			s.color = string.color;
		}

		for(var card of data.cards){
			var c = this.newCard();
			c.setHoles(card.holes);
			for(var k=0; k<card.strings.length; k++){
				string = c.setString(k, this.strings[card.strings[k]]);
			}
			c.setThreading(card.threading);
		}
		this.width = data.width;
		this.setLength(data.length);

		this.twists = data.twists;

	}

	var Card = function(){
		this.holes = 4;
		this.strings = [];
		this.threading;
	}
	Card.prototype.setString = function(index, string){
		if (index>=this.holes) return;
		this.strings[index] = string;
	}
	Card.prototype.setHoles = function(holes){
		this.holes = holes

		if (this.strings.length>this.holes){
			for(var k=this.strings.length; k>this.holes; k--){
				this.strings.splice(-1,1);
			}
		}
	}
	Card.prototype.setStrings = function(){
		this.strings = [];
		for(var k=0; k<this.holes && k<arguments[k].length; k++){
			this.setString(index, arguments[k])
		}
	}
	Card.prototype.setThreading = function(threading){
		if(!threading || !(threading==="z" || threading==="s")) return;
		if(!this.threading){
			this.threading = threading;
			return;
		}
		if (this.threading !== threading){
			this.strings.reverse();
		}
	}
	Card.prototype.isValid = function(){
		if (!this.holes) return false;
		if (this.holes<=1) return false;
		if (this.holes !== this.strings.length) return false;
		for (var string of this.strings){
			if (!(string instanceof String)) return false;
		}
		if (!this.threading) return false;

		return true;
	}

	var String = function(){
		this.id;
		this.color;
	}
	String.prototype.setColor = function(hex){
		this.color = hex;
	}

	var loopValue = function(value, max, min=0){
		var v = value-min;
		while(v<0)v = max-min+v+1;
		return v%(max-min+1) + min;
	}

	return {
		Ribbon: Ribbon
    };
})();

var ribbon = new CardWeaver.Ribbon();

function setup(){
	ribbon.load('{"width":8,"length":8,"cards":[{"holes":4,"strings":[2,2,2,2],"threading":"z"},{"holes":4,"strings":[1,0,1,0],"threading":"z"},{"holes":4,"strings":[0,1,0,1],"threading":"z"},{"holes":4,"strings":[1,0,1,0],"threading":"z"},{"holes":4,"strings":[0,1,0,1],"threading":"s"},{"holes":4,"strings":[1,0,1,0],"threading":"s"},{"holes":4,"strings":[0,1,0,1],"threading":"s"},{"holes":4,"strings":[2,2,2,2],"threading":"s"}],"twists":[[-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,1,1,1,1],[-1,-1,-1,-1,1,1,1,1],[-1,-1,-1,-1,1,1,1,1],[1,1,1,1,-1,-1,-1,-1],[1,1,1,1,-1,-1,-1,-1],[1,1,1,1,-1,-1,-1,-1],[1,1,1,1,1,1,1,1]],"strings":[{"color":"blue"},{"color":"red"},{"color":"grey"}]}')
	drawRibbon(40);
	fillRibbon();
	generateCardSettings()
}

function drawRibbon(length){
	var ribbonPreview = document.getElementById("ribbonPreview");
	var turnInstructions = document.getElementById("turnInstructions");
	ribbonPreview.innerHTML = "";
	turnInstructions.innerHTML = "";
	for (var k=0; k<length; k++){
		var row_preview = ribbonPreview.insertRow(0);
		for (var k2 = 0; k2<ribbon.width; k2++){
			row_preview.insertCell(k2);
		}
		var row_instructions = turnInstructions.insertRow(0);
		row_instructions.insertCell(0);
	}

}
function generateCardSettings(){
	var parrent = document.getElementById("card_settings");
	parrent.innerHTML = "";

	// tabs
	var tabs = document.createElement("ul");
	tabs.onclick = function(e){
		e = e || window.event;
		var element = e.target || e.srcElement;
		if (element.nodeName.toLowerCase() != "li")return;

		var sections = document.getElementById("card_settings").getElementsByClassName("section");
		for(var sec of sections){
			sec.className = "section";
		}

		var tabs = document.getElementById("card_settings").getElementsByTagName("li");
		for(var tab of tabs){
			tab.style = "";
		}
		element.style.backgroundColor="white";
		sections[element.value].className = "section active";
	}
	for(var k=0; k<ribbon.width; k++){
		var tab = document.createElement("li");
		tab.value=k;
		tabs.appendChild(tab);
	}
	parrent.appendChild(tabs);

	// sections
	for(var k=0; k<ribbon.width; k++){
		let card = ribbon.cards[k];

		// holes
		let section = document.createElement("div");
		section.className="section";

		let holes_selector = document.createElement("input");
		holes_selector.type = "number";
		holes_selector.max = 12;
		holes_selector.min = 2;
		holes_selector.value = card.holes;
		holes_selector.onchange = function(){
			card.setHoles(holes_selector.valueAsNumber);
			generateCardSettings();
			fillRibbon();
		};
		section.appendChild(holes_selector);

		// strings
		for(var k2=0; k2<card.holes; k2++){

			let string_selector = document.createElement("select");
			string_selector
			string_selector.style.backgroundColor = card.strings[k2].color;
			let index = k2;
			string_selector.onchange=function(){
				string_selector.style.backgroundColor = ribbon.strings[string_selector.value].color;
				card.setString(index,ribbon.strings[string_selector.value]);
				fillRibbon();
			}

			for(var k3=0; k3<ribbon.strings.length; k3++){
				var option = document.createElement("option");
				option.value = k3;
				option.innerHTML = "string "+k3;
				option.style.backgroundColor = ribbon.strings[k3].color;
				string_selector.appendChild(option);
			}

			section.appendChild(string_selector);
		}
		parrent.appendChild(section);
	}
	document.getElementById("card_settings").getElementsByClassName("section")[0].className="section active";
}
function fillRibbon(){
	var rows_instructions = document.getElementById("turnInstructions").getElementsByTagName("tr");
	var rows_preview = document.getElementById("ribbonPreview").getElementsByTagName("tr");
	for (var k=0; k<rows_preview.length; k++){
		var inv_k = rows_preview.length-1-k;
		var colors = ribbon.getTopRowStrings(k);
		var twists = ribbon.getTopRowTwists(k);
		// Instructions


		if (ribbon.length-1<k){
			rows_instructions[inv_k].className="grey";
			rows_preview[inv_k].className="grey";
		}

		var cells_preview =  rows_preview[inv_k].getElementsByTagName("td")
		for (var k2 = 0; k2<ribbon.width; k2++){
			var cell_preview = cells_preview[k2]
			cell_preview.style.backgroundColor = colors[k2].color;
			if (twists[k2]<0){
				cell_preview.className="left";
			}
			else{
				cell_preview.className="right";
			}
		}
	}
}
function swapTwist(e){
	e = e || window.event;
	var element = e.target || e.srcElement;
	var cell;
	var row;
	if (element.nodeName.toLowerCase() == "td"){
		column = element.cellIndex;
		row = element.parentNode.rowIndex;
		row = document.getElementById("ribbonPreview").getElementsByTagName("tr").length-1 - row;
	}
	else return;

	ribbon.swapTwist(row, column);
	fillRibbon();
	//alert('You click on row ' + row+" and cell "+column);
}
