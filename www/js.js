var app = {
	initialize:function(){
		this.changeScreenSize();
		document.addEventListener("deviceready", function(){app.onDeviceReady();console.log("deviceready");}, false);
		document.addEventListener("load", function(){app.onDeviceReady();console.log("load");}, false);
		$(document).ready(function(){console.log("jquery ready");app.onDeviceReady();})

		$(window).bind('resize', this.changeScreenSize);

	},
	changeScreenSize:function(){
		/* var log = document.getElementById("log");
		log.innerText="zmiana orientacji, aktualnie " + window.orientation +"\r\n"
            + "width: " + window.innerWidth + "\r\nheight: " + window.innerHeight;*/
        var cols = $(".column");
        var rows = $(".row");
        var len = rows.length;
        var min = (Math.min(window.innerWidth,window.innerHeight)-20)*0.9;
		var marginleft = (window.innerWidth - min)/2;
		var margintop = (window.innerHeight - min)/2;
        cols.each((i,e)=>{$(e).css('width',min/9);});
        rows.each(function(index,element){
                  //console.log(index + " " + element);
                  if(!$(element).hasClass("empty")){
                    //$(element).css('background-color','#'+(Math.round(0xFFF/len) * index).toString(16));
                  }
                  $(element).css('height',min/9);
                  
                  });
        
        $("#gameArea").css('height',min).css('width',min).css('top',Math.min(window.innerWidth,window.innerHeight)*0.05).css('left',marginleft).css('top',margintop);
		var popuptop = ($(window).height() - $('#help .popup').outerHeight())/2;
		$("#debug").text(popuptop);
		$(".popup").each(function(index,element){
			$(element).css({
				position:'relative',
				top: ($(window).height() - $(element).outerHeight())/2
			});
		})
	},
	onDeviceReady:function() {
		console.log("onDeviceReady start");

		console.log("onDeviceReady koniec");
		
		this.changeScreenSize();
		
		document.addEventListener("orientationchange",this.changeScreenSize);
		document.addEventListener("onresize",this.changeScreenSize);
		document.addEventListener("resize",this.changeScreenSize);
	},
	showHelp:function(){
		$('#help').css('display','block');
		$(".popup").css({
            position:'relative',
            top: ($(window).height() - $('.popup').outerHeight())/2
        });

	},
	closeWindow:function(popup){
		$(popup).css('display','none');
	}
}
	


function Timer(options) {
  var timer,
  instance = this,
  seconds = options.seconds || 0,
  updateStatus = options.onUpdateStatus || function () {},
  counterEnd = options.onCounterEnd || function () {};

  function increment() {
    updateStatus(seconds);
    seconds++;
  }

  this.start = function () {
    clearInterval(timer);
    timer = 0;
	seconds= 0;
    timer = setInterval(increment, 1000);
  };
  
  this.resume = function () {
	  clearInterval(timer);
	  timer = setInterval(increment, 1000);
  }

  this.stop = function () {
    clearInterval(timer);
	updateStatus(seconds);
	return seconds;
  };
  this.restart = function () {
	  this.stop();
	  this.start();
  }
}

function toMMSS(seconds){
	var sec_num = parseInt(seconds, 10)    
	var minutes = Math.floor(sec_num / 60)
	var seconds = sec_num % 60    
	return [minutes,seconds]
		.map(v => v < 10 ? "0" + v : v)
		.join(":")
}

var Game={
	timer: new Timer({
		onUpdateStatus: function(sec){
			$("#timer").text(toMMSS(sec));
			}
		}),
	fields: {},
	fieldsLength:0,
	marbles:0,
	selectedField:undefined,
	previousSelectedField:undefined,
	movesCounter:0,
	historyCounter:0,
	history:{},
	init:function(){
		app.initialize();
		this.timer.stop();
		this.selectedField=undefined;
		this.previousSelectedField=undefined;
		this.fields={};
		this.fieldsLength=0;
		this.movesCounter=0,
		this.historyCounter=0;
		this.marbles=0;
		this.history={};
		this.generateDOM();
		this.addActionsOnFields(this);

	},
	generateFields:function(){
		this.fields={};
		for(var i=0;i<9;i++){
			this.fields[i]={};
			for(var j=0;j<9;j++){
				this.fields[i][j] = {};
				this.fields[i][j]["type"]="field";
				this.fields[i][j]["i-index"]=i;
				this.fields[i][j]["j-index"]=j;
			}
		}
	},
	clearField:function(i,j){
			this.fields[i][j]["div"].addClass("empty");
			this.fields[i][j]["div"].empty();
			this.fields[i][j]["type"]=undefined;
		},
	generateDOM:function(){
		$("#timer").text(toMMSS(0));
		$("#movesCounter").text("0");
		this.generateFields();
		$("#gameArea").empty();
		for(var i=0;i<9;i++){
			var column= $("<div/>",{
				class: 'column'
			}).appendTo("#gameArea");
			for(var j=0;j<9;j++){
				var div = $("<div/>",{
					class:'row'
				}).appendTo(column);
				$("<div/>",{
					class:'hole'
				}).appendTo(div);
				this.fields[i][j]["div"]=div;
				this.fieldsLength++;
			}
			
		};	
		for(var i=0;i<9;i++){
			this.clearField(0,i);
			this.clearField(8,i);
			this.clearField(i,0);
			this.clearField(i,8);
		}
		for(var i=-3;i<=3;i++){
			for(var j=-3;j<=3;j++){
				if(Math.abs(i*j)>3){
					this.clearField(4+i,4+j);
				}
			}
		}	

		app.changeScreenSize();
		//this.timer.start();
	},
	addActionsOnFields:function(scope){
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if (this.fields[i][j]["type"]=="field"){

					console.log("dodaje funkcje dla " + i + " " + j);
					this.fields[i][j]["div"].click({i:i,j:j},function(e){
						scope.onFieldClick(e)				
					});
					/*this.fields[i][j]["div"][0].addEventListener("click", function(var1,var2) { 
						scope.onFieldClick(var1+"dupa",var2+""); }(i,j),false);
					console.log(this.fields[i][j]["div"][0]);*/
				}
			}
		}
	},
	onFieldClick:function(event){;
		var i = event.data.i;
		var j = event.data.j;
		if(this.marbles===0){
			this.generateMarbles(i,j);
		}
		else {
			if(this.fields[i][j]["marble"]){
				this.clickedFieldWithMarble(i,j);
			}
			else if(this.selectedField!=undefined){
				this.makeMove(this.fields[i][j]);
			}

		}
	},
	
	generateMarbles:function(x,y){
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if (this.fields[i][j]["type"]=="field"){
					if(i!=x || j!=y){
						this.fields[i][j]["marble"]=true;
						this.marbles++;
						var marble= $("<div/>",{
							class: 'marble'
						}).appendTo(this.fields[i][j]["div"]);
					}
					else{
						this.fields[i][j]["marble"]=false;
					}
					
				}
			}
		}
		this.timer.start();
	},
	clickedFieldWithMarble:function(i,j){
		$(".cango").removeClass("cango");
		console.log("klikniete " + i + " " + j, this.fields[i][j]);
		this.previousSelectedField=this.selectedField;
		if(this.previousSelectedField != undefined)
			this.previousSelectedField["div"].removeClass("selected");
		this.selectedField=this.fields[i][j];
		//if(this.fields["marble"]){
			this.selectedField["div"].addClass("selected");
		//}
		this.checkWhereCanGo();
	},
	
	checkWhereCanGo(){
		if(this.selectedField != undefined){
			var i = this.selectedField["i-index"];
			var j = this.selectedField["j-index"];
			for(var x=-1;x<=1;x++){
				for(var y=-1;y<=1;y++){
					if(Math.abs(x)!=Math.abs(y) && this.isMarble(i+1*x,j+1*y) && this.isEmpty(i+2*x,j+2*y)){
						console.log("sprawdzam i=",i+2*x,", j=",j+2*y);
						console.log("czy pole ", this.isField(i+2*x,j+2*y));
						console.log("czy pole jest puste ", this.isEmpty(i+2*x,j+2*y));
						console.log("czy pole jest kulka ", this.isMarble(i+2*x,j+2*y));
						this.fields[i+2*x][j+2*y]["div"].addClass("cango");
					}
				}
			}
		}
	},
	
	isField:function(i,j){
		if(this.fields[i]==undefined) return false;
		if(this.fields[i][j]==undefined) return false;
		if(this.fields[i][j]["type"]!="field") return false;
		return true;
	},
	
	isMarble:function(i,j){
		return this.isField(i,j) && this.fields[i][j]["marble"]
		
	},
	
	isEmpty:function(i,j){
		return this.isField(i,j) &&  !this.fields[i][j]["marble"]
	},
	
	makeMove:function(destination){
		if(this.validateMove(this.selectedField,destination)){
			this.movesCounter++;
			this.historyCounter++;
			this.updateMovesCounter();
			var marble = this.selectedField["div"].children().last().detach();
			var betweenField = this.findBetweenElement(this.selectedField,destination);
			this.history[this.historyCounter] = {
				"from":this.selectedField,
				"to":destination,
				"deleted":betweenField
			};
			console.log("from",this.selectedField,
				"to",destination,
				"deleted",betweenField);
			this.fields[destination["i-index"]][destination["j-index"]]["marble"]=true;
			this.selectedField["marble"]=false;
			destination["div"].append(marble);
			betweenField["marble"]=false;
			this.history[this.historyCounter]["marble"] = betweenField["div"].children().last().detach();
			$(".cango").removeClass("cango");
			this.marbles--;
			if(this.checkPossibleMoves()<1){
				if(this.marbles==1){
					this.win();
				}
				else{
					this.lose();
				}
			}
		}
	},
	
	undoMove:function(){
		if(this.historyCounter>0){
			var move = this.history[this.historyCounter];
			var marble = move["to"]["div"].children().last().detach();
			move["from"]["div"].append(marble);
			move["deleted"]["marble"]=true;
			move["deleted"]["div"].append(move["marble"]);
			move["to"]["marble"]=false;
			move["from"]["marble"]=true;
			this.marbles++;
			this.historyCounter--;
			this.movesCounter++;
			this.updateMovesCounter();
			if(this.checkPossibleMoves()>0){
				this.timer.resume();
			}
		}
	},
	
	validateMove:function(field1,field2){
		var i = Math.abs(field1["i-index"] - field2["i-index"]);
		var j = Math.abs(field1["j-index"] - field2["j-index"]);
		console.log(i + j == 2 && i * j ==0);
		return (i + j == 2 && i * j ==0);
	},
	
	findBetweenElement:function(field1,field2){
		var middleI = (field1["i-index"] + field2["i-index"])/2;
		var middleJ = (field1["j-index"] + field2["j-index"])/2;
		return this.fields[middleI][middleJ];
	},
	
	checkPossibleMoves:function(){
		var possibleMoves=0;
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				for(var x=-1;x<=1;x++){
					for(var y=-1;y<=1;y++){
						if(Math.abs(x)!=Math.abs(y) &&this.isMarble(i,j) && this.isMarble(i+1*x,j+1*y) && this.isEmpty(i+2*x,j+2*y)){
							possibleMoves++;
						}
					}
				}
			}
		}
		return possibleMoves;		
	},
	
	win:function(){
		this.timer.stop();
		$("#win").css('display','block');
	},
	
	lose:function(){
		this.timer.stop();
		$("#lose").css('display','block');
	},
	
	updateMovesCounter:function(){
		$("#movesCounter").text(this.movesCounter);
	},
	
}

$(document).ready(function(){Game.init();})
