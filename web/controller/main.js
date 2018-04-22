/**
 * Copyright 2015 Google Inc. All Rights Reserved.
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
 */
'use strict';

var handCurrentUser = "";
var buttonFirstTxt = "";
var buttonSecondTxt = "";
var firstVibrationSkipped = false;

function setBackgroundImage(attribut, imageName, sizeWidth) {
    return attribut + ' { background: url(img/' + imageName + '.png); background-size: ' + sizeWidth + 'px; } ';
}

// Initializes NotAlone.
function NotAlone() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.imageFirst = document.getElementById('img-first');
  this.imageSecond = document.getElementById('img-second');

  this.imageFirst.addEventListener('click', this.sendVoteFirst.bind(this));
  this.imageSecond.addEventListener('click', this.sendVoteSecond.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
NotAlone.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();

  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};


NotAlone.prototype.sendVoteFirst = function() {
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Send a vote entry to the Firebase Database.
    this.database.ref("cooking/" + currentUser.uid).set({
      vote: buttonFirstTxt,
      hand: handCurrentUser,
    }).then(function() {

    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
}

NotAlone.prototype.sendVoteSecond = function() {
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Send a vote entry to the Firebase Database.
    this.database.ref("cooking/" + currentUser.uid).set({
      vote: buttonSecondTxt,
      hand: handCurrentUser,
    }).then(function() {

    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
}

// Signs-out of NotAlone.
NotAlone.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
NotAlone.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!

    // get the choosen hand from the database
    var handRef = this.database.ref('people/' + user.uid);
    // continually listen to hand changes in database (in case of switching)
    handRef.on('value', function(snapshot) {
      //var divContent = document.getElementById("content");
      // make sure we clean the content of the page (screen)
      // divContent.innerHTML = "";

      // get the value of the hand (left or right)
      handCurrentUser = snapshot.val().hand;

      // if left
      if (handCurrentUser == "Left") {
          // set values to save in database when the user vote
          buttonFirstTxt = "Release";
          buttonSecondTxt = "Grab";
          $('#img-hand').css('transform', 'rotate(5deg)');
      }
      // else ... we suppose it is right
      else {
          // set values to save in database when the user vote
          buttonFirstTxt = "Mash";
          buttonSecondTxt = "Cook";
          $('#img-hand').css('transform', 'rotate(-5deg)');
      }
      $('#img-hand').css('z-index', -1);

      var newHTMLcontent = ''

      //var headerHandRef = document.getElementById("header-hand");
      //var buttonFirst = document.getElementById('btn-first');
      //var buttonSecond = document.getElementById('btn-second');
      // document.getElementById("imageid").src="../template/save.png";
      //headerHandRef.innerHTML = handCurrentUser;
      /*if (handCurrentUser == "Left") {
          buttonFirstTxt = "Grab";
          buttonSecondTxt = "Release";
      } else {
          buttonFirstTxt = "Mash";
          buttonSecondTxt = "Cook";
      }*/

      $('#img-first').css("height", screen.height/3*0.875 + "px");
      $('#img-first').css("width", screen.height/3 + "px");
      $('#img-second').css("height", screen.height/3*0.875 + "px");
      $('#img-second').css("width", screen.height/3 + "px");
      $('#img-hand').css("height", screen.height/7 + "px");
      $('#img-hand').css("width", screen.height/7 + "px");
      var imageFirst = document.getElementById("img-first");
      //imageFirst.src = "img/" + buttonFirstTxt.toLowerCase() + ".png";
      var css = setBackgroundImage("#img-first", buttonFirstTxt.toLowerCase(), screen.height/3);
      css    += setBackgroundImage("#img-second", buttonSecondTxt.toLowerCase(), screen.height/3);
      css    += setBackgroundImage("#img-first:active", buttonFirstTxt.toLowerCase() + '_press', screen.height/3);
      css    += setBackgroundImage("#img-second:active", buttonSecondTxt.toLowerCase() + '_press', screen.height/3);
      css    += '#img-hand { background: url(img/' + handCurrentUser.toLowerCase() + '_hand.gif); background-size: ' + screen.height/7 + 'px; } ';

      var style = document.createElement('style');
      if (style.styleSheet) {
          style.styleSheet.cssText = css;
      } else {
          style.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName('head')[0].appendChild(style);
      imageFirst.width = screen.height/3;

      var imageSecond = document.getElementById("img-second");
      //imageSecond.src= "img/" + buttonSecondTxt.toLowerCase() + ".png";
      imageSecond.width = screen.height/3;
    });
    var failureRef = this.database.ref('failure');
    failureRef.on('value', function(snapshot) {
      if (firstVibrationSkipped) {
        window.navigator.vibrate(200);
        console.log("it should vibrate");
      } else {
        firstVibrationSkipped = true;
      }
    });
  } else { // User is signed out!
    // Show sign-in button, etc.
    window.location.href = "choseHand.html";
  }
};




// Returns true if user is signed-in. Otherwise false and displays a message.
NotAlone.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };

  return false;
};

// Checks that the Firebase SDK has been correctly setup and configured.
NotAlone.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.NotAlone = new NotAlone();
};
