var MLJS = MLJS || {};
MLJS.NeuralNet= (function (win, doc){
	var input_layer_size = 400; //number of features
	var hidden_layer_size = 25;
	var num_labels = 10; //number of possible output labels
	var Theta;
	
	function init(){
		////////////// example of how to use neural net for training and prediction ////////////////	
		var myWorker = new Worker("/js/workers/nnworker.js");
		var lambda=1; //the amount of 'slack', to prevent overfitting to training data. 0 is none.
		var X, y, nn_params, m;
		var initial_nn_params;		
		
		//load some sample training data
		var _X=numeric.getURL('/csv/X.csv').responseText;
		var _y=numeric.getURL('/csv/y.csv').responseText;
		var _nn_params = numeric.getURL('/csv/nn_params.csv').responseText;
		var options ={'MaxIter': /*50*/5}; //more itereations lead to better data fitting but longer running time.

		myWorker.onmessage = function (oEvent) {
			var d = oEvent.data;
			if(d[d.length-1] === 'train'){
				//d[0] is the unrolled Theta matrix of weights, d[1] is the 'error' at each iteration of min. function. Should go down every index.
		  		myWorker.postMessage({'method':'predict', 'X':_X, 'Theta':d[0] });		
		  	}
		  	else if(d[d.length-1] === 'predict'){
		  		//d[0] is a vector of confidence for each prediction, d[1] is the prediction itself
			}
		};
		
		myWorker.postMessage({'method':'train' ,'cf':"nnCostFunction", 'nn_params':_nn_params, 'options':options,'input_layer_size':input_layer_size, 'hidden_layer_size':hidden_layer_size, 'num_labels':num_labels, 'X':_X, 'y':_y, 'lambda':lambda });		
	}
	
	function train(worker, _X, _y){
		var myWorker = new Worker("/js/workers/nnworker.js");
		var lambda=.1;		
		var options ={'MaxIter': /*50*/5};		
		var initial_theta1=randInitializeWeights(input_layer_size, hidden_layer_size);
		var initial_theta2=randInitializeWeights(hidden_layer_size, num_labels);
		var initial_nn_params = unroll(initial_theta1).concat(unroll(initial_theta2));

		worker.onmessage = function (oEvent) {
			var d = oEvent.data;
			if(d[d.length-1] === 'train'){
				//d[0] is the unrolled Theta matrix of weights, d[1] is the 'error' at each iteration of min. function. Should go down every index.	
		  	}
		  	else if(d[d.length-1] === 'predict'){
		  		//d[0] is a vector of confidence for each prediction, d[1] is the prediction itself
			}
		};	
		worker.postMessage({'cf':"nnCostFunction", 'nn_params':initial_nn_params, 'options':options,'input_layer_size':input_layer_size, 'hidden_layer_size':hidden_layer_size, 'num_labels':num_labels, 'X':_X, 'y':_y, 'lambda':lambda });				
	}

	function predict(worker, _X, Theta){
		worker.onmessage = function (oEvent) {
			var d = oEvent.data;
			if(d[d.length-1] === 'train'){
				//d[0] is the unrolled Theta matrix of weights, d[1] is the 'error' at each iteration of min. function. Should go down every index.
		  	}
		  	else if(d[d.length-1] === 'predict'){
		  		//d[0] is a vector of confidence for each prediction, d[1] is the prediction itself
			}
		};				
		worker.postMessage({'method':'predict', 'X':_X, 'Theta':Theta });				
	}

	return {
		init:init,
		train:train,
		predict:predict
	};
}(window, document));

MLJS.NeuralNet.init();
