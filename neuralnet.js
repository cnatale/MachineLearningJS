var MLJS = MLJS || {};
MLJS.NeuralNet= (function (win, doc){
	var input_layer_size = 400; //number of features
	var hidden_layer_size = 25;
	var num_labels = 10; //number of possible output labels
	var lambda=.1;	
	var Theta;	
	function init(){

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
