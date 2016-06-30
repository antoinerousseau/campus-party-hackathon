#!/usr/bin/env node

'use strict';

const Telegraf = require('telegraf');
var TelegrafRecast = require('telegraf-recast');

var app = new Telegraf('261398004:AAGtd_vgo2SKKzRqDd821fHZFwvCLghjcEE');
const recast = new TelegrafRecast('4de44c33da0fc597351e5d140fda9c84');

// Setting the recast handler
app.use( recast.middleware() );

//Shows the current user stack
var currentUserStack = [];

//Represents the steps that the given user should follow
// for the application to work
var stepsToPass = [];

/**
 * Handler for the greeting of the user
 * */
recast.onIntent('greeting', function * () {
    /* print of the messages */
    console.log('Intent of greeting');
    console.log(this.state.recast.intent);              // first intent
    console.log(this.state.recast.sentence);            // first sentence
    console.log(this.state.recast.message);


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
    console.log(this.state.recast.intent);
    console.log(this.message);
    console.log('==== END OF MESSAGE HANDLING ====')
});

//We start the polling process for the application
app.startPolling();