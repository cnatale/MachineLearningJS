var MLJS = MLJS || {};
MLJS.NeuralNet= (function (win, doc){
	var input_layer_size = 400; //number of features
	var hidden_layer_size = 25;
	var num_labels = 10; //number of possible output labels
	var lambda=.1;	
	var Theta;	
	function init(){
		/*
		////////////// example of how to use neural net for training and prediction ////////////////	
		var myWorker = new Worker("/js/workers/nnworker.js");
		var lambda=1; //the amount of 'slack', to prevent overfitting to training data. 0 is none.
		var X, y, nn_params, m;
		var initial_nn_params;		
		
		//load some sample training data
		var _X=numeric.getURL('/csv/X.csv').responseText;
		var _y=numeric.getURL('/csv/y.csv').responseText;
		
		var _nn_params = numeric.getURL('/csv/nn_params.csv').responseText;
		var options ={'MaxIter': 20}; //more itereations lead to better data fitting but longer running time.

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
		////////////////////////////////////////////////////////////////////////////////////////////
		* */
		
		//testing with new data
		/*
		var myWorker = new Worker("/js/workers/nnworker.js");		
		myWorker.onmessage = function (oEvent) {
			
			var d = oEvent.data;
			if(d[d.length-1] === 'train'){
				//debugger;
				//d[0] is the unrolled Theta matrix of weights, d[1] is the 'error' at each iteration of min. function. Should go down every index.
		  		myWorker.postMessage({'method':'predict', 'X':_Xstr});		
		  	}
		  	else if(d[d.length-1] === 'predict'){
		  		debugger;
		  		//d[0] is a vector of confidence for each prediction, d[1] is the prediction itself
			}
		};
				
		var _X = [[1,1,1,1,1],[0,0,0,0,0]];
		var _y = [[0],[1]]; 
		var _Xstr = numeric.toCSV(_X);
		var _ystr = numeric.toCSV(_y);
		train(myWorker, _Xstr, _ystr);
		*/
	}
	
	function getWebWorker(){
		return new Worker("/js/workers/nnworker.js");
	}
	
	function train(worker, _X, _y, input_layer_size, hidden_layer_size, num_labels){

			
		var options ={'MaxIter': 50};		
		var initial_theta1=randInitializeWeights(input_layer_size, hidden_layer_size);
		var initial_theta2=randInitializeWeights(hidden_layer_size, num_labels);
		var initial_nn_params = unroll(initial_theta1).concat(unroll(initial_theta2));
		var nn_params_str = numeric.toCSV(initial_nn_params);
		worker.postMessage({'method':'train','cf':"nnCostFunction", 'nn_params':nn_params_str, 'options':options,'input_layer_size':input_layer_size, 'hidden_layer_size':hidden_layer_size, 'num_labels':num_labels, 'X':_X, 'y':_y, 'lambda':lambda });				
	}

	function predict(worker, _X, Theta){			
		worker.postMessage({'method':'predict', 'X':_X, 'Theta':Theta });				
	}

	/**
	 * randomly initialize weights of a layer with L_in incoming connections and L_out outgoing connections
	 */
	function randInitializeWeights(L_in, L_out){
	   /*Note that W should be set to a matrix of size(L_out, 1 + L_in) as
		the column row of W handles the "bias" terms*/ 
		//numeric['/']();
		var W = rand(L_out, 1 + L_in);
		var eps = .12;
		W = numeric['*'](W, (2 * eps) - eps);
		return W;
	}
	
	function rand(r,c){
		if (r instanceof Array){
			c = r[1];
			r = r[0];
		}		
		//TODO:optimize
		var arr=new Array(r);
		for(var i=0;i<r;i++){
			arr[i] = new Array(c);
			for(var j=0; j<c; j++){
				arr[i][j]=Math.random();
			}
		}
		return arr;	
	}	
	
	/**
	 * unroll a 2d matrix into a row vector 
	 */
	function unroll(A){
		var B=[], ctr=0, i=0, j=0;
		
		if(A[0] instanceof Array){ //A is a matrix
			for (j=0;j<A[0].length;j++){
				for(i=0; i<A.length;i++){				
					//if(A[i][j] instanceof Array){ //strip out any extra array wrapper
					//	B[ctr]=A[i][j][0];
					//}
					//else{
						B[ctr]=[A[i][j]]; //a column vector
					//}
					ctr++;
				}
			}			
		
		}
	
		return B;
	}		

	return {
		init:init,
		train:train,
		predict:predict,
		getWebWorker:getWebWorker
	};
}(window, document));

MLJS.NeuralNet.init();
