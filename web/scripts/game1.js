	//grab canvas element and context for drawing
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	//load kitchen image background and then draw it
	var kitchen = new Image();
	kitchen.src="images/oven.png";
	/*kitchen.onload= function(){
		drawKitchen();
	}*/

	//get current canvas width and height and fill a rectangle
	var w = canvas.width;
	var h = canvas.height;
	//ctx.fillStyle= "white";
	//ctx.fillRect(0,0, w, h);

	//draw background kitchen image to fill width and height of screen
	function drawKitchen(){
		ctx.drawImage(kitchen, 0,0, w, h);
	}


	//count the number of votes for an option
	FriendlyChat.prototype.countVotes = function(){
		//Reference to the /messages/ database path
		this.messagesRef = this.database.ref('cooking');
		
		
		var myDB = firebase.database();
		var ref = myDB.ref("cooking/left");
		ref.on("value", function(snapshot) {
		  	//console.log(snapshot.val());
		  	var countOp1=0, countOp2=0, countOp3 = 0;
			snapshot.forEach(function(data) {
				switch(data.val().vote){
				case "btn-first":
					countOp1++;
					break;
				case "btn-second":
					countOp2++;
					break;
				case "btn-third":
					countOp3++;
					break;
				}
		    //console.log("The " + data.key + " has value " + data.val());
		  });
			document.getElementById("releaseVotes").innerHTML = countOp1;
			document.getElementById("grabVotes").innerHTML = countOp2;
			console.log("Votes for 1: " + countOp1);
		    console.log("Votes for 2: " + countOp2);
		    console.log("Votes for 3: " + countOp3);
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});
	}
