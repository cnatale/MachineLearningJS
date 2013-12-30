var Dialogue = Dialogue || {};
Dialogue.View = (function (win, doc){
	var canvas,stage;
	var girlsSprite, pokeySprite, mrTSprite;
	var selectedSprite=0, sprites;
	function init(){
		canvas = doc.getElementById("dialogueCanvas");
		stage = new createjs.Stage(canvas);
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setFPS(30);
		createjs.Ticker.useRAF = true;
		createjs.Touch.enable(stage);
		sprites= initSprites();
		girlSprite= sprites[0];
		pokeySprite= sprites[1];
		mrTSprite = sprites[2];
		pokeySprite.x=64; pokeySprite.y=64;
		mrTSprite.x=128; mrTSprite.y = 128;
		stage.addChild(girlSprite);
		stage.addChild(pokeySprite);
		stage.addChild(mrTSprite);
		
		document.onkeydown = checkKey;
		
		/* Info to pass to neural net:
		 * -number of chars onscreen
		 * -each character's hairtype, skintype, clothing, direction they are facing
		 * 
		 */
		
	}
	
	function checkKey(e){
	    e = e || window.event;
		var s = sprites[selectedSprite];
	    if (e.keyCode == '38') {
	        // up arrow
	        if(s.currentAnimation != "walkBack")
	        	s.gotoAndPlay("walkBack");
	       	createjs.Tween.get(s, {override:true}).to({y: s.y-24}, 300);  	        
	    }
	    else if (e.keyCode == '40') {
	        // down arrow
	        if(s.currentAnimation != "walkForward")
	        	s.gotoAndPlay("walkForward");	      
	       	createjs.Tween.get(s, {override:true}).to({y: s.y+24}, 300);    
	    }		
	    else if (e.keyCode == '37'){
	    	// left arrow
	    	if(s.currentAnimation != "walkLeft")
	        	s.gotoAndPlay("walkLeft");	  
	       	createjs.Tween.get(s, {override:true}).to({x: s.x-16}, 200);  	          	
	    }
	    else if (e.keyCode == '39'){
	     	// right arrow
	     	if(s.currentAnimation != "walkRight")
	        	s.gotoAndPlay("walkRight");	  
	       	createjs.Tween.get(s, {override:true}).to({x: s.x+16}, 200);  	           	
	    }
	    else if (e.keyCode == '32'){
	    	// spacebar
	    	selectedSprite++;	    	
	    	if(selectedSprite>=sprites.length)
	    		selectedSprite=0;	
	    }	
	}
	
	function initSprites(){
		var girlData = {
		    framerate: 3,
			images:['/img/earthbound_people_sheet.gif'],
			frames:[
				[6,4,16,24,0,0,0],
				[98,4,16,24,0],
				[24,4,16,24,0],
				[116,4,17,24,0],
				[43,4,16,24,0],
				[136,4,16,24,0],
				[155,4,16,24,0],
				[61,4,16,24,0]
			],
			animations:{
				walkForward:{
					frames:[0,1]
				},
				walkLeft:{
					frames:[2,3]
				},
				walkBack:{
					frames:[4,5]
				},
				walkRight:{
					frames:[6,7]
				}									
			}
		};
		var pokeyData = {
		    framerate: 3,
			images:['/img/earthbound_people_sheet.gif'],
			frames:[
				[5,91,16,24,0,0,0],
				[78,91,16,24,0],
				[24,91,16,24,0],
				[96,91,17,24,0],
				[42,91,16,24,0],
				[114,91,16,24,0],
				[133,91,16,24,0],
				[61,91,16,24,0]				
			],
			animations:{
				walkForward:{
					frames:[0,1]
				},
				walkLeft:{
					frames:[2,3]
				},
				walkBack:{
					frames:[4,5]
				},
				walkRight:{
					frames:[6,7]
				}	
			}
		};
		var mrTData = {
		    framerate: 3,
			images:['/img/earthbound_people_sheet.gif'],
			frames:[
				[2,442,16,24,0,0,0],
				[20,442,16,24,0],
				[38,442,16,24,0],
				[54,442,16,24,0],
				[72,442,16,24,0],
				[90,442,16,24,0],
				[108,442,16,24,0],
				[124,442,16,24,0]						
			],
			animations:{
				walkForward:{
					frames:[0,1]
				},
				walkLeft:{
					frames:[2,3]
				},
				walkBack:{
					frames:[4,5]
				},
				walkRight:{
					frames:[6,7]
				}	
			}
		};		
		var girlSpritesheet=new createjs.SpriteSheet(girlData);
		var pokeySpritesheet=new createjs.SpriteSheet(pokeyData);
		var pokeySprite = new createjs.Sprite(pokeySpritesheet, "walk");
		pokeySprite.hair=2;pokeySprite.skin=0;pokeySprite.clothing=2;
		var girlSprite = new createjs.Sprite(girlSpritesheet,"walk" );
		girlSprite.hair=0;girlSprite.skin=0;girlSprite.clothing=0;
		var mrTSpritesheet=new createjs.SpriteSheet(mrTData);
		var mrTSprite = new createjs.Sprite(mrTSpritesheet,"walk" );	
		mrTSprite.hair=1;mrTSprite.skin=1;mrTSprite.clothing=1;	
		return [girlSprite, pokeySprite, mrTSprite];	
	}
	
	function getSprites(){
		return sprites;
	}
	
	function tick(e){
		stage.update(e);
	}
	
	return {
		init:init,
		getSprites:getSprites
	};
}(window, document));

Dialogue.View.init();
