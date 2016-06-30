#!/usr/bin/env node

'use strict';

const Telegraf = require('telegraf');
var TelegrafRecast = require('telegraf-recast');
var firebase = require("firebase");

/* init of the firebase instance */
firebase.initializeApp({
    serviceAccount: "CPMX7-Hackathon-d12564e6cfec.json",
    databaseURL: "https://cpmx7-hackathon.firebaseio.com/"
});

var app = new Telegraf('261398004:AAGtd_vgo2SKKzRqDd821fHZFwvCLghjcEE');
const recast = new TelegrafRecast('4de44c33da0fc597351e5d140fda9c84');

// Setting the recast handler
app.use( recast.middleware() );

//Shows the current user stack
var currentUserStack = [];

//Represents the steps that the given user should follow
// for the application to work
var stepsToPass = [];

//console.log(this.state.recast.intent);              // first intent
//console.log(this.state.recast.sentence);            // first sentence
//console.log(this.state.recast.message);

/**
 * Handler for the greeting of the user
 * */
recast.onIntent('greeting', function * () {
    /* print of the messages */
    console.log('Intent of greeting');

    //We just simply reply the user answer
    this.reply('¡Hola soy Luis tu asistente de construcción personal!');
});

/**
 * Handler for the number intent of the application
 * */
recast.onIntent('number-answer', function * () {
    /* print of the messages */
    console.log('Intent of number-answer');
    console.log(this.state.recast.intent);              // first intent
    console.log(this.state.recast.message);
    console.log(this.message);

    // Get first room entity
    var numberAnswer = this.state.recast.firstEntity('number');
    if( numberAnswer ){
        //You provided the number
        this.reply('Number ' + numberAnswer);
    }else{
        this.reply('You should reply a number');
    }
});


/**
 * Handler for the number intent of the application
 * */
recast.onMessage( function * () {
    console.log('Message handling');
    console.log('user id: '+ this.message.from.id );
    console.log('==== END OF MESSAGE HANDLING ====');

    // We try to register the user to the database if it's not set
    registerUser( this.message.from.id );
});

/**
 * Registers the current user in the telegram database
 * */
function registerUser( userId ){
    var ref = firebase.database().ref('/users/' + userId);
    ref.on("value", function(snapshot) {
        var values = {};
        if (snapshot.val() != null) {
            values = snapshot.val();
        }

        /* object to be saved to firebase */
        var values = {
            id : userId,
            client: 'telegram'
        };

        firebase.database().ref("/users/" + userId).set(values);
    }, function (errorObject) {
        //Printing the error object
        console.log( errorObject );

        this.reply('¡Oh no!, Hubo un error intenta de nuevo');
    });
}

//We start the polling process for the application
app.startPolling();