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
    var handRef = this.database.ref('people/' + user.uid);
    handRef.on('value', function(snapshot) {
      handCurrentUser = snapshot.val().hand;
      var headerHandRef = document.getElementById("header-hand");
      var buttonFirst = document.getElementById('btn-first');
      var buttonSecond = document.getElementById('btn-second');
      // document.getElementById("imageid").src="../template/save.png";
      headerHandRef.innerHTML = handCurrentUser;
      if (handCurrentUser == "Left") {
          buttonFirstTxt = "Grab";
          buttonSecondTxt = "Release";
      } else {
          buttonFirstTxt = "Mash";
          buttonSecondTxt = "Cook";
      }
      var imageFirst = document.getElementById("img-first");
      imageFirst.src = "img/" + buttonFirstTxt.toLowerCase() + ".png";
      var css = '#img-first:active { background: url(img/' + buttonFirstTxt.toLowerCase() + '_press.png); background-size: ' + screen.height/2.5 + 'px; }';
      css += '#img-second:active { background: url(img/' + buttonSecondTxt.toLowerCase() + '_press.png); background-size: ' + screen.height/2.5 + 'px; }';
      var style = document.createElement('style');
      if (style.styleSheet) {
          style.styleSheet.cssText = css;
      } else {
          style.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName('head')[0].appendChild(style);
      imageFirst.width = screen.height/2.5;

      var imageSecond = document.getElementById("img-second");
      imageSecond.src= "img/" + buttonSecondTxt.toLowerCase() + ".png";
      imageSecond.width = screen.height/2.5;


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
