/**
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Game1.js
 * Author: Jamie McKee-Scott
 * Purpose: Creates the main game functionality for the ROBOTATO mini-game
 */
'use strict';
var score;
var totalVotes = [0,0,0,0];
var voteType = ["Cook", "Mash", "Grab", "Release"];
window.onload = function(){
	//gameStart();
	window.friendlyChat = new FriendlyChat();
	score = 0;
};

//grab canvas element and context for drawing
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const LENGTH_OF_VOTE = 10;
const LENGTH_OF_PAUSE = 7; 

//load steam images
var steam1 = new Image();
steam1.src= "images/steam-1.png";
var steam = new Image();
steam.src= "images/steam.png";
var fireImg = new Image();
fireImg.src = "images/fire-small.png";
var pot1 = new Image(), pot2 = new Image(), pot3 = new Image(),pot4 = new Image();
pot1.src = "images/pot-cold-small.png";
pot2.src = "images/pot-heating-small.png";
pot3.src = "images/pot-done-0-small.png";
pot4.src = "images/pot-done-1-small.png";

var bowl1 = new Image();
bowl1.src = "images/bowl-small.png";

var mashed = new Image();
mashed = "images/mashed-small.png";

//get current canvas width and height and fill a rectangle
var w = 1000;
var h = 500;
var ratio = w/h;


//count the number of votes for an option
FriendlyChat.prototype.countVotes = function(){
	//Reference to the /messages/ database path
		
	var myDB = firebase.database();
	var ref = myDB.ref("cooking");
	ref.on("value", function(snapshot) {
	  	console.log(snapshot.val());
	  	totalVotes= [0,0,0,0];
		snapshot.forEach(function(data) {
			//if they selected the right hand
			if(data.val().hand == "Right"){
				if(data.val().vote == "Cook"){
					totalVotes[0]++;
				}else{
					totalVotes[1]++;
				}
			}
			//else they're voting on the left hand
			else{
				if(data.val().vote == "Grab"){
					totalVotes[2]++;
				}else{
					totalVotes[3]++;
				}
			}
	    //console.log("The " + data.key + " has value " + data.val());
	  });
		displayVotes();
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
}

function displayVotes(){
	document.getElementById("cookVotes").innerHTML = totalVotes[0];
	document.getElementById("mashVotes").innerHTML = totalVotes[1];
	document.getElementById("grabVotes").innerHTML = totalVotes[2];
	document.getElementById("releaseVotes").innerHTML = totalVotes[3];
	console.log("Votes for Cook: " + totalVotes[0]);
    console.log("Votes for Mash: " + totalVotes[1]);
    console.log("Votes for Grab: " + totalVotes[2]);
    console.log("Votes for Release: " + totalVotes[3]);
}



function overlayOn(num) {
    document.getElementById("overlay"+num).style.display = "block";
}

function overlayOff(num) {
    document.getElementById("overlay"+num).style.display = "none";
}

/* starts countdown timer to game start
 * displays time count as an overlay over main game page
 * when time reaches 0 the over lay is closed and the
 * mini game level commences
*/
function gameStart(){
	var time = 3;
	overlayOn(1);

	var countdown = window.setInterval(function(){
		time = time - 1;
		document.getElementById("timer").innerHTML = time;
		
		if(time == 0){
			clearInterval(countdown);
			overlayOff(1);
			beginCooking();
		}
	}, 1000);
}

function beginCooking(){
	displayInstructions();
	//while time is still going, keep cooking potatoes
	/*var gameMins = 3, gameSecs = 59;
	var totalGameInterval = window.setInterval(function(){
		gameSecs = gameSecs - 1;
		if(gameSecs == 0){
			gameSecs = 59;
			gameMins = gameMins - 1;
		}
		//display times
		if(gameMins == 0){
			clearInterval(totalGameInterval);
			gameOver();
		}
	}, 1000);*/
	onePotatoIteration();
	//increase potatoe score
}
/*
 * players must correctly identify the correct actions to take 
 * to complete cooking "mashed potatoes". They have ten seconds to vote
 * at the end we check what the majority on the right
 * and the majority on the left have voted for
 * if it is incorrect we vote again, otherwise we move to the next task
*/
function onePotatoIteration(){
	
	var majorityLeft = 0, majorityRight = 0;
	var voteTime = LENGTH_OF_VOTE, isPaused = false, pauseCount = LENGTH_OF_PAUSE;
	document.getElementById("voteTime").innerHTML = voteTime;
	overlayOn(2);

	var voteInterval = window.setInterval(function(){
		if(!isPaused){
			voteTime = voteTime -1;
			document.getElementById("voteTime").innerHTML = voteTime;
		}
		if(voteTime == 0){
			majorityLeft = checkMajority("Left");
			majorityRight = checkMajority("Right");

			//if the majorities have successfully selected the correct two options
			if(majorityLeft == "Grab" && majorityRight == "Cook"){
				//clear the game timer for this portion of the level
				clearInterval(voteInterval);
				overlayOff(2);
				//pause the game timer and animate pot
				isPaused = true;
				var pauseInterval = window.setInterval(function(){
					pauseCount = pauseCount - 1;
					if(pauseCount > 5)
						drawPot(1);
					else if(pauseCount > 3)
						drawPot(2);
					else if(pauseCount > 0)
						drawPot(3);
					if(pauseCount == 0){
						clearInterval(pauseInterval);
						//end on time, begin the second victory case
						//secondPotatoIteration();
						pauseCount = LENGTH_OF_PAUSE;
						isPaused = false;
						voteTime = LENGTH_OF_VOTE;
					}
				}, 100);
				
			}else{
				//case where the majorities were unsuccessful so we need 
				//set the kitchen on fire and then go vote again

				isPaused = true;
				var pauseInterval = window.setInterval(function(){
					pauseCount = pauseCount - 1;
					showFire(1);
					
					if(pauseCount == 0){
						clearInterval(pauseInterval);
						showFire(0);
						pauseCount = LENGTH_OF_PAUSE;
						isPaused = false;
						voteTime = LENGTH_OF_VOTE;
					}
				}, 100);
				
				document.getElementById("voteTime").innerHTML = "Vote Again";
			}
		}

	}, 1000);	
	
	//do{
	//	majority = performVote();
	//}while(majority[0] != "Release" || majority != "Mash");
}

function secondPotatoIteration(){
	
	var majorityLeft = 0, majorityRight = 0;
	var voteTime = LENGTH_OF_VOTE, isPaused = false, pauseCount = LENGTH_OF_PAUSE;
	document.getElementById("voteTime").innerHTML = voteTime;
	overlayOn(2);

	var voteInterval = window.setInterval(function(){
		if(!isPaused){
			voteTime = voteTime -1;
			document.getElementById("voteTime").innerHTML = voteTime;
		}
		if(voteTime == 0){
			majorityLeft = checkMajority("Left");
			majorityRight = checkMajority("Right");

			//if the majorities have successfully selected the correct two options
			if(majorityLeft == "Release" && majorityRight == "Mash"){
				//clear the game timer for this portion of the level
				clearInterval(voteInterval);
				overlayOff(2);
				//pause the game timer and animate bowl
				isPaused = true;
				var pauseInterval = window.setInterval(function(){
					pauseCount = pauseCount - 1;
					drawBowl();
					/*if(pauseCount > 5)
						drawBowl(1);
					else if(pauseCount > 3)
						drawBowl(2);
					else if(pauseCount > 0)
						drawBowl(3);
					*/
					if(pauseCount == 0){
						clearInterval(pauseInterval);
						score++;
						displayPotato();
						pauseCount = LENGTH_OF_PAUSE;
						isPaused = false;
						voteTime = LENGTH_OF_VOTE;
					}
				}, 100);
				
			}else{
				//case where the majorities were unsuccessful so we need 
				//set the kitchen on fire and then go vote again

				isPaused = true;
				var pauseInterval = window.setInterval(function(){
					pauseCount = pauseCount - 1;
					showFire(1);
					
					if(pauseCount == 0){
						clearInterval(pauseInterval);
						showFire(0);
						pauseCount = LENGTH_OF_PAUSE;
						isPaused = false;
						voteTime = LENGTH_OF_VOTE;
					}
				}, 100);
				
				document.getElementById("voteTime").innerHTML = "Vote Again";
			}
		}

	}, 1000);	
	
	//do{
	//	majority = performVote();
	//}while(majority[0] != "Release" || majority != "Mash");
}

function showFire(whichOne){
	if(whichOne == 0)
		ctx.clearRect(0,0,w,h);
	else if(whichOne == 1)
		ctx.drawImage(fireImg, 0,0);
}

function drawPot(whichOne){
	ctx.clearRect(115, 10, 50, 40);
	if(whichOne == 1)
		ctx.drawImage(pot1,0,0,96,100, 115, 0, 45, 50);
	else if(whichOne == 2)
		ctx.drawImage(pot2,0,0,96,100, 115, 0, 45, 50);
	else ctx.drawImage(pot3,0,0,96,100, 115, 0, 45, 50);
}

function drawBowl(){
	ctx.drawImage(bowl1,0,0,100,86, 200, 40, 50, 35);
}

function drawPotato(){
	//for(var i = 0; i < score; i++){
		ctx.drawImage(mashed,0,0,100,95, 50, 40, 50, 35);
	//}
}

function displayInstructions(){
	console.log("Make potatoes");
}

function animateStove(){
	console.log("The stove turns on");
}

function checkMajority(hand){
	if(hand == "Right"){
		if(totalVotes[0] == totalVotes[1])
			return "Tie";
		else if(totalVotes[0] > totalVotes[1])
			return "Cook";
		else return "Mash";
	}else{
		if(totalVotes[2] == totalVotes[3])
			return "Tie";
		else if(totalVotes[2] > totalVotes[3])
			return "Grab";
		else return "Release";
	}
}

