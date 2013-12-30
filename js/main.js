var Dialogue = Dialogue || {};
Dialogue.Main = (function (win, doc){
	function init(){
		var canvas = document.getElementById("dialogueCanvas");
		canvas.style.width='512px';
		canvas.style.height='416px';		
		
		var groupList = ['Moms', 'Pokeys', "Mr. T's"];
		var momInfo = [0,1,0,1];
		var pokeyInfo = [0,0,0,0];
		var mrTInfo = [1,0,1,2];
		var nn = MLJS.NeuralNet;
		var ww = nn.getWebWorker();
		ww.onmessage = function (oEvent) {
			var d = oEvent.data;
			if(d[d.length-1] === 'train'){
				//d[0] is the unrolled Theta matrix of weights, d[1] is the 'error' at each iteration of min. function. Should go down every index.
		  		
		  }
		  else if(d[d.length-1] === 'predict'){
		  		$('#output').html("A.I. predicts group is "+ groupList[d[1][0]] +" with a probability of "+ d[0][0]);
		  		//d[0] is a vector of confidence for each prediction, d[1] is the prediction itself
			}
		};

		var _X = [momInfo,pokeyInfo,mrTInfo];
		var _y = [[0],[1],[2]]; 
		var _Xstr = numeric.toCSV(_X);
		var _ystr = numeric.toCSV(_y);
		var input_layer_size = 4; //number of features
		var hidden_layer_size = 4;
		var num_labels = 3; //number of possible output labels		
		nn.train(ww, _Xstr, _ystr, input_layer_size, hidden_layer_size, num_labels);

		
		$('#predictBtn').click(function(e){			
			var __X = [[parseInt($('#hairList').val()),parseInt($('#shirtList').val()),parseInt($('#shoeList').val()), parseInt($('#pantsList').val())]];
			var _Xstr = numeric.toCSV(__X);
			ww.postMessage({'method':'predict', 'X':_Xstr});		
		});
	}

	
	function OnResizeCalled(){
		var canvas = document.getElementById("dialogueCanvas");
		var gameWidth = window.innerWidth;
		var gameHeight = window.innerHeight;
		var scaleToFitX = gameWidth / 256;
		var scaleToFitY = gameHeight / 208;
		var currentScreenRatio = gameWidth/gameHeight;
		var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
		
		if (currentScreenRatio >= 1.6 && currentScreenRatio <= 1.9){
			canvas.style.width=gameWidth + 'px';
			canvas.style.height=gameHeight + 'px';
		}	
		else{
			canvas.style.width =256*optimalRatio + 'px';
			canvas.style.height = 208*optimalRatio + 'px';
		}
	
	}
	
	return {
		init:init
	};
}(window, document));

Dialogue.Main.init();
