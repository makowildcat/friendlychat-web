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
  this.headerHand = document.getElementById('header-hand');
  this.buttonFirst = document.getElementById('btn-first');
  this.buttonSecond = document.getElementById('btn-second');
  this.buttonThird = document.getElementById('btn-third');
  this.buttonFourth = document.getElementById('btn-fourth');
  this.buttonFifth = document.getElementById('btn-fifth');

  this.buttonFirst.addEventListener('click', this.sendVote.bind(this, this.buttonFirst.id));
  this.buttonSecond.addEventListener('click', this.sendVote.bind(this, this.buttonSecond.id));
  this.buttonThird.addEventListener('click', this.sendVote.bind(this, this.buttonThird.id));
  this.buttonFourth.addEventListener('click', this.sendVote.bind(this, this.buttonFourth.id));
  this.buttonFifth.addEventListener('click', this.signOut.bind(this));

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


NotAlone.prototype.sendVote = function(e) {
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Send a vote entry to the Firebase Database.
    this.database.ref("cooking/left/" + currentUser.uid).set({
      vote: e,
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
      //var handText = div.querySelector('#header-hand');
      var div = document.getElementById("header-hand");
      div.innerHTML = snapshot.val().hand;
    });

    this.database.ref('people/' + user.uid).once('value').then(function(snapshot) {
      var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      // ...
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
