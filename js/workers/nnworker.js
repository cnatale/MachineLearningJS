importScripts('/js/extlib/numeric-1.2.6.js');
var Theta, input_layer_size, hidden_layer_size, num_labels, nn_params;
onmessage = function (oEvent) {	
	var d = oEvent.data;
	var X = d.X, y = d.y;

	//when creating a neural net from scratch, populate the thetas with this method
	//var initial_theta1=randInitializeWeights(input_layer_size, hidden_layer_size);
	//var initial_theta2=randInitializeWeights(hidden_layer_size, num_labels);
	//var initial_nn_params = unroll(initial_theta1).concat(unroll(initial_theta2));

	if(d.method === 'train'){
		input_layer_size = d.input_layer_size;
		hidden_layer_size = d.hidden_layer_size;
		num_labels = d.num_labels;
		var lambda= d.lambda;		
		X = numeric.parseCSV(X); 
		X.pop();
		y = numeric.parseCSV(y);
		y.pop();
		nn_params = d.nn_params;
		nn_params = numeric.parseCSV(nn_params);
		nn_params.pop();
		var m = X.length;		
		var res = fmincg(nnCostFunction, nn_params, d.options, input_layer_size, hidden_layer_size, num_labels, X, y, lambda);
		res.push('train');
		Theta = res[0];
		postMessage(res); //res[0] contains the unrolled, updated Theta1 and Theta2 weight matrix used for prediction.
	}
	else if(d.method === 'predict'){
		X = numeric.parseCSV(X); 
		X.pop();

		var _Theta1 = reshape(Theta.slice(0,hidden_layer_size * (input_layer_size + 1)), hidden_layer_size, (input_layer_size + 1));
		var _Theta2 = reshape(Theta.slice((hidden_layer_size * (input_layer_size + 1)), nn_params.length), num_labels, (hidden_layer_size + 1));
		var prediction =  predict(_Theta1, _Theta2, X);
		prediction.push('predict');
		postMessage(prediction);
	}
};


function fmincg(f, X, options, P1, P2, P3, P4, P5, P6){
	"use strict";
	var _X = X, i, length, red, st = new Date();
	if(options.hasOwnProperty('MaxIter')){
		length = options.MaxIter;
	}
	else{
		length = 100;
	}

	var RHO = 0.01;                            // a bunch of constants for line searches
	var SIG = 0.5;       // RHO and SIG are the constants in the Wolfe-Powell conditions
	var INT = 0.1;    // don't reevaluate within 0.1 of the limit of the current bracket
	var EXT = 3.0;                    // extrapolate maximum 3 times the current bracket
	var MAX = 20;                         // max 20 function evaluations per line search
	var RATIO = 100;                                      // maximum allowed slope ratio		
	
	//compose string used to call function
	var argstr = 'f(_X';
	for (var q=0; q< arguments.length -3; q++){
		var tmp = q+1;
		argstr = argstr + ",P" + tmp;
	}
	argstr = argstr + ");";
	if(length instanceof Array && length.length===2){
		red=length[1];
		length = length[0];
	}
	else
		red=1;
	var S = 'Iteration ';	
	var i = 0;                                            // zero the run length counter
	var ls_failed = 0;                             // no previous line search has failed
	var fX = [];	
	var tmp = eval(argstr);
	var f1 = tmp[0];								//returned cost function
	var df1 = tmp[1];								//returned unrolled gradient vector
	i = i + (length<0);                                            // count epochs?!
	var s = numeric['*'](df1, -1);                                        // search direction is steepest
	var d1 = numeric.dot(numeric.transpose(numeric['*'](s,-1)),s);                                                 // this is the slope		
	var z1 = red/(1-d1);
	var X0, f0, f1, f2, f3, df0, df1, tmp2, df2, d2, d3, z2, z3, A, B, M, success, limit, _t1, _t2, _t3, et, time; //declare vars used in inner loop so we don't keep instantiating new ones
	
	while(i < Math.abs(length)){				//while not finished
		i = i + (length>0);
		X0 = _X; f0 = f1; df0 = df1;				//make a copy of current values
		_X = numeric['+'](_X, numeric['*'](z1,s));				//begin line search
		tmp2 = eval(argstr);
		f2 = tmp2[0]; df2 = tmp2[1];
		i = i + (length<0);
		d2 = numeric.dot(numeric.transpose(df2), s);
		f3 = f1; d3 = d1; z3 = numeric['*'](z1, -1);			//initialize point 3 equal to point 1
		if(length > 0)
			M = MAX;
		else
			M = Math.min(MAX, -length -i);
		success = 0; limit = -1;					//initialize quantities
			
		while(1){
			while((f2 > f1+z1*RHO*d1 || (d2 > -SIG*d1)) && (M>0)){
				limit = z1;								//tighten the bracket
				if (f2 > f1)
					z2 = z3 - (0.5*d3*z3*z3)/(d3*z3+f2-f3);		//quadratic fit
				else{
					A = 6*(f2-f3)/z3 + 3*(d2+d3);		//cubic fit
					B = 3*(f3-f2)-z3*(d3+2*d2);
					z2 = (Math.sqrt(B*B-A*d2*z3*z3)-B)/A;
				}
				if(isNaN(z2) || !isFinite(z2))
					z2 = z3/2;			//if we had a numerical problem then bisect
				z2 = Math.max(Math.min(z2, INT*z3), (1-INT)*z3);	//update the step
				z1 = z1 + z2;
				_X = numeric['+'](_X, numeric['*'](z2,s));
				tmp2 = eval(argstr);
				f2= tmp2[0];
				df2 = tmp2[1];
				M = M - 1; i = i + (length<0);			//count epochs?
				d2 = numeric.dot(numeric.transpose(df2), s);
				z3 = z3-z2;					//z3 is now relative to the location of z2
			}
			
			if((f2 > f1+z1*RHO*d1) || (d2 > -SIG*d1))
				break;								//this is a failure
			else if (d2 > SIG*d1){
				success=1; break;					//success
			}
			else if (M === 0)
				break;								//failure
			
			A = 6*(f2-f3)/z3+3*(d2[0][0]+d3[0][0]);				//make cubic extrapolation
			B = 3*(f3-f2)-z3*(d3[0][0]+2*d2[0][0]);
			z2 = -d2[0][0]*z3*z3/(B+Math.sqrt(B*B-A*d2[0][0]*z3*z3));	
			if(isNaN(z2) || !isFinite(z2) || z2<0 ){	//num prob or wrong sign?
				if(limit < 0.5)						//if we have no upper limit
					z2 = z1 * (EXT-1);				//extrapolate the maximum amount
				else
					z2 = (limit-z1)/2;				//otherwise bisect
			}
			else if(limit > -0.5 && z2+z1 > limit)		//extrapolation beyond the max?
				z2 = (limit-z1)/2;					//bisect
			else if(limit < -0.5 && z2+z1 > z1*EXT)		//extrapolation beyond the limit
				z2 = z1*(EXT-1.0);					//set to extrapolation limit
			else if(z2 < -z3*INT)
				z2 = -z3*INT;
			else if(limit > -0.5 && z2 < (limit-z1)*(1.0-INT))	//too close to limit?
				z2 = (limit-z1)*(1.0-INT);
			f3 = f2; d3 = d2; z3 = -z2;				//set point 3 equal to point 2
			z1 = z1 + z2; 
			_X = numeric['+'](_X, numeric['*'](z2,s));	//update current estimates
			tmp2 = eval(argstr);
			f2=tmp2[0]; df2 = tmp2[1];
			M = M -1; i = i + (length<0);
			d2 = numeric.dot(numeric.transpose(df2), s);		//count epochs
		}
		
		if(success){						//if line search succeeded
			f1 = f2; //fX = numeric.transpose([numeric.transpose(fX), f1]);
			fX.push([f1]);
			et = new Date(); time = et-st; st = new Date();
			console.log(S + ' ' + i + ' | Cost: ' + f1 + ' | Time: '+ time);
			//Polack-Ribiere direction
			_t1 = numeric['-'](numeric.dot(numeric.transpose(df2),df2)  ,  numeric.dot(numeric.transpose(df1),df2));
			_t2 = numeric.dot(numeric.transpose(df1), df1);
			_t3 = numeric['/'](_t1,_t2); var _t4 = numeric['*'](_t3[0][0],s);
			//equiv to matrix division
			s = numeric['-'](_t4, df2);
			tmp = df1; df1=df2; df2 = tmp;				//swap derivatives
			d2 = numeric.dot(numeric.transpose(df1),s);
			if(d2 > 0){									//new slope must be negative
				s = numeric['*'](df1, -1);				//otherwise use steepest direction
				d2 = numeric.dot(numeric.transpose(numeric['*'](s,-1)), s);
			}
			z1 = z1 * Math.min(RATIO, d1/(d2-Number.MIN_VALUE));			//slope ratio but max RATIO
			d1=d2;
			ls_failed=0;					//this line search did not fail
		}
		else{
			_X= X0; f1 = f0; df1 = df0;		//restore point from before failed line search
			if(ls_failed || i > math.abs(length))		//line search failed twice in a row
				break;							//or we ran out of time, so we give up
				
			tmp = df1; df1 = df2; df2 = tmp;		//swap derivatives
			s = numeric['*'](df1, -1);				//try steepest
			d1= numeric.dot(numeric['*'](s, -1), s );
			z1 = 1/(1-d1);
			ls_failed=1;					//this line search failed
		}
	}
	
	
	return [_X, fX, i];
} 


function predict(Theta1, Theta2, X){
	var m = X.length;
	var num_labels= Theta2.length;
	var p= zeros(m, 1);
	
	//calculate the activation vector for the hidden layer
	var _h = hconcat(ones(m , 1), X);
	var h1 = sigmoid( numeric.dot(_h , numeric.transpose(Theta1) ));
	//calculate output vector
	var _h2 = hconcat(ones(m , 1), h1);
	var h2 = sigmoid( numeric.dot(_h2 , numeric.transpose(Theta2) ));	
	
	var confidence = [], predictedIndex = [];
	for(var i=0; i < h2.length; i++){
		confidence[i] = getMaxOfArray(h2[i]);
		predictedIndex[i] = h2[i].indexOf(confidence[i]);
	}

	return [confidence, predictedIndex];
		
}
function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}		

/**
 *Implements the neural network cost function for a two layer neural network which performs classification 
 */
var nnCostFunction = function(nn_params, input_layer_size, hidden_layer_size, num_labels, X, y, lambda){
	/*
		 * Computes the cost and gradient of the neural network. The
  		   parameters for the neural network are "unrolled" into the vector
		   nn_params and need to be converted back into the weight matrices. 
 
		   The returned parameter grad should be a "unrolled" vector of the
		   partial derivatives of the neural network.
		 */
	
	//Reshape nn_params back into the parameters Theta1 and Theta2, the weight matrices
	//for our 2 layer neural network
	var Theta1 = reshape(nn_params.slice(0,hidden_layer_size * (input_layer_size + 1)), hidden_layer_size, (input_layer_size + 1));
	var Theta2 = reshape(nn_params.slice((hidden_layer_size * (input_layer_size + 1)), nn_params.length), num_labels, (hidden_layer_size + 1));
	var m = X.length;	
	var J = 0;	
	Theta1_grad = zeros(size(Theta1));
	Theta2_grad = zeros(size(Theta2));	
		
	//first, create matrix of possible outputs for one-vs-all approach to selecting labels for H
	//format: [1,0,0,0,0,0,0,0,0,0];[0,1,0,0,0,0,0,0,0,0];...	
	var I = numeric.identity(num_labels);

	var Y = zeros(m, num_labels);
	for (var i=0; i <m; i++){
		Y[i] = I[y[i][0]/*-1*/]; //the test data requires an offset of 1 to work correctly
	}		
	var Theta1t = numeric.transpose(Theta1);
	var Theta2t = numeric.transpose(Theta2);
	var A1 = hconcat(ones(m,1), X); //add bias units for each activation layer
	var Z2 = numeric.dot(A1, Theta1t); //Theta1 is the transformation matrix for layer 1, A1 the 0or1 activation matrix
	var A2 = hconcat(ones(Z2.length, 1), sigmoid(Z2)); //add bias unit for A2, and use sigmoid to convert Z2 output to 0or1
	var Z3 = numeric.dot(A2, numeric.transpose(Theta2)); //same approach as Z2
	var A3;
	var H = A3 = sigmoid(Z3); //final result of forward propagation - classification answer based on neural network settings
	
	//limit overfitting through regularization, starting at col2 for theta's to skip bias unit'	
	var slack = (lambda/(2*m)) * ( numeric.sum(numeric.pow(hslice(Theta1, 1, Theta1[0].length), 2))   +   numeric.sum(numeric.pow(hslice(Theta2, 1, Theta2[0].length),2)) );
	
	var t1 = numeric['*'](numeric['*'](Y, -1),numeric.log(H));
	var t2 = numeric['*'](numeric['-'](1,Y), numeric.log(numeric['-'](1,H)));
	J = (1/m) * numeric.sum( numeric.sub(t1 , t2));
	J = numeric['+'](J,slack);
	//calculate 'error' of our hypothesis at every activation node
	var Sigma3 = numeric['-'](A3,Y); 
	var Sigma2 = numeric['*']( numeric.dot(Sigma3,Theta2), sigmoidGradient(hconcat(ones(Z2.length,1), Z2)) );
	Sigma2 = hslice(Sigma2, 1, Sigma2[0].length);
	var Delta_1 = numeric.dot(numeric.transpose(Sigma2),A1);
	var Delta_2 = numeric.dot(numeric.transpose(Sigma3),A2);
	
	/*acquire regularized gradient for theta1 and theta2.
	 Note that the gradient is used for calculating local minima by "stepping" towards minima using 
	 gradient descent algorithm or a faster alternative. This minima means our neural network classifies correctly
	 with the highest probability given inputs that match the training set.*/
	var Theta1_grad = numeric['+']( numeric['/'](Delta_1,m),  numeric['*']((lambda/m), hconcat(zeros(Theta1.length,1), hslice(Theta1, 1, Theta1[0].length))));
	var Theta2_grad = numeric['+']( numeric['/'](Delta_2,m),  numeric['*']((lambda/m), hconcat(zeros(Theta2.length,1), hslice(Theta2, 1, Theta2[0].length))));

	//unroll gradients
	var grad = unroll(Theta1_grad).concat(unroll(Theta2_grad));
	return [J, grad];
};

/**
 * Computes the gradient of the sigmoid function
   evaluated at z. This should work regardless if z is a matrix or a
   vector. In particular, if z is a vector or matrix, you should return
   the gradient for each element.
 */
function sigmoidGradient(z){
	var g = zeros(z.length);
	//same old sigmoid function as for logistic regression, only generalized using per-element multiplication
	//for matrix, vector or scalar
	g = numeric['*'](sigmoid(z), numeric['-'](1,sigmoid(z)));
	return g;
}
	
/**
 *Sums individual rows of a matrix, returning a vector 
 */
function rowsum(A){
	var B = [];
	for(var i=0; i<A.length;i++){
		if (A[i] instanceof Array){ //A is a matrix, sum the row
			var ctr=0;
			for (j=0;j<A[i].length;j++){
				ctr+=A[i][j];
			}
			B[i]=ctr;
		}
		else{
			//A is a vector, no summation necessary
			B[i]=A[i];
		}
	}
	
	return B;
}

function hslice(A, s, e){
	var B = new Array();
	for (var i=0; i< A.length; i++){
		B[i] = A[i].slice(s,e);
	}		
	return B;
}
/**
 * horizontally concatenates two matrices with equal # rows 
 */
function hconcat(A, B){
	//note: A and B must be matrices
	var C = new Array();
	for (var i=0; i< A.length; i++){
		C[i] =A[i].concat(B[i]);
	}

	return C;
}

function size(A){
	return [A.length, A[0].length];
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

/**
 * Return a matrix with given dimensions r c whose elements are taken from matrix A. 
 */
function reshape(A, r, c){
	var arr=new Array(r);
	var ctr=0;
	var i=0;
	//init cols
	for(i=0; i<r;i++){
		arr[i] = new Array(c);		
	}
	
	for(var j=0; j<c; j++){
		for(i=0;i<r;i++){
			if(A[ctr] instanceof Array){
				arr[i][j]=A[ctr][0];
			}
			else{
				arr[i][j]=A[ctr];
			}	
			
			ctr++;
		}
	}		
	return arr;
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

/**
 * Returns sigmoid function applied to parameter
 * @param {Object} z Can be a real number, vector, or 2d matrix
 */
function sigmoid(z){
	if (z instanceof Array){
		var arr = new Array();
		for(var i=0;i<z.length;i++){
			if(z[0] instanceof Array){
				//z is a matrix/2d array
				arr[i] = [];
				for(var j=0; j<z[0].length; j++){
					arr[i][j]= sigmoid(z[i][j]);
				}					
			}
			else{
				//z is a vector/1d array
				arr[i] = sigmoid(z[i]); 
			}
			
		}
		return arr;
	}
	else{
		//note: z must be a real number
		return 1.0 / (1.0 + Math.exp(-z));
	}
}

function ones(r,c){
	if (r instanceof Array){
		c = r[1];
		r = r[0];
	}	
	//TODO:optimize
	var arr=new Array(r);
	for(var i=0;i<r;i++){
		arr[i] = new Array(c);
		for(var j=0; j<c; j++){
			arr[i][j]=1;
		}
	}
	return arr;	
}

function zeros(r,c){
	if (r instanceof Array){
		c = r[1];
		r = r[0];
	}
	//TODO:optimize
	var arr=new Array(r);
	for(var i=0;i<r;i++){
		arr[i] = new Array(c);
		for(var j=0; j<c; j++){
			arr[i][j]=0;
		}
	}
	return arr;	
}

function stripExtraArr(A){
	for(var i=0; i<A.length; i++){
		A[i]=A[i][0];
	}
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
