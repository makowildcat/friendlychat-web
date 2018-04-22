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

// Initializes NotAlone.
function NotAlone() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.buttonLeft = document.getElementById('btn-left');
  this.buttonRight = document.getElementById('btn-right');
  this.buttonAuto = document.getElementById('btn-auto');

  this.buttonLeft.addEventListener('click', this.signIn.bind(this, "Left"));
  this.buttonRight.addEventListener('click', this.signIn.bind(this, "Right"));
  //this.buttonAuto.addEventListener('click', this.assignAuto.bind(this));

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

NotAlone.prototype.saveHand = function(e) {
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Send a vote entry to the Firebase Database.
    this.database.ref("people/" + currentUser.uid).set({
      hand: this.hand,
    }).then(function() {
        window.location.href = "index.html";
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

/*
NotAlone.prototype.assignAuto = function() {
  var countLeft = 0;
  var countRight = 0;
  this.database.ref('people').once('value').then(function(snapshot) {
    snapshot.forEach(function(data) {
      switch(data.val().hand){
        case "Right":
          countRight++;
          break;
        case "Left":
          countLeft++;
          break;
      }
    });
}).then(function() {
    if (countRight > countLeft) {
      this.signIn("Left");
    } else {
      this.signIn("Left");
    }
});
};
*/

// Signs-in NotAlone.
NotAlone.prototype.signIn = function(e) {
  // Sign in Firebase using anonymous identity.
  this.hand = e;
  this.auth.signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
  });
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
NotAlone.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    if (this.hand != undefined) {
      this.saveHand()
    } else {
      window.location.href = "index.html";
    }
  } else { // User is signed out!
    // Show sign-in button, etc.
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
