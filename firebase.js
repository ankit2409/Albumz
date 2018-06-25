var firebase=require('firebase');
var admin=require('firebase-admin');
 var config = {
    apiKey: "AIzaSyCWzsLR__DNT654_MsgMgMSiu81iMcDiR0",
    authDomain: "albumz-a5ebd.firebaseapp.com",
    databaseURL: "https://albumz-a5ebd.firebaseio.com",
    projectId: "albumz-a5ebd",
    storageBucket: "albumz-a5ebd.appspot.com",
    messagingSenderId: "771410957449"
  };
var instance = firebase.initializeApp(config);
module.exports.FirebaseInstance = instance;