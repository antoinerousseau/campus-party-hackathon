#!/usr/bin/env node

'use strict';

const https = require('https');
const Telegraf = require('telegraf');
const TelegrafRecast = require('telegraf-recast');
const firebase = require('firebase');
const q = require('q');
const firebaseHandler = require('./firebase-handler');
const sessionHandler = require('./session.handler');

/* init of the firebase instance */
firebase.initializeApp({
    serviceAccount: "Firebase.json",
    databaseURL: "https://cpmx7-hackathon.firebaseio.com/"
});

const telegrafOptions = {
    telegram: {
        agent: new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 5000
        })
    }
};

const telegraf = new Telegraf('259408097:AAG6FyQ1rW9Hz8I0gCGFAiFLyHvwuwEj6Hg', telegrafOptions);
//telegraf.use(Telegraf.memorySession());

const recast = new TelegrafRecast('32b653b3dca4016c7815e9411966ff1f');
telegraf.use(recast.middleware());

//Setting the current state of the user
var currentState = 'beginning';
var errorCount = 0;
var failMessage = 'Parece que esa no es la respuesta que busco ahora';

/**
 * Handler for the greeting of the user
 * */
recast.onIntent('greeting', function * () {
    /* we first check if the intent is applicable */
    if( !sessionHandler.stepCanUseIntent( currentState )){
        errorCount ++;
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }

    /* print of the messages */
    //console.log('Intent of greeting: ' + currentState );

    //We send the init message
    this.reply( sessionHandler.getStepQuestion( currentState ) );

    //We update the step of the user
    currentState = firebaseHandler.updateStep( getCurrentUserId( this.message ), currentState, '');

    //We ask the first question
    //this.reply( sessionHandler.getStepQuestion( currentState ) );

    //We send a greeting picture
    telegraf.sendPhoto( this.message.chat.id,
        {
            url: 'https://cpmx7-hackathon.firebaseapp.com/chatimg/greeting.png',
            filename: 'greeting.png'
        });
});

/**
 * Handler for the yes/no answers in the process
 * */
recast.onIntent('yes-no-answer', function * () {
    /* we first check if the intent is applicable */
    if( !sessionHandler.stepCanUseIntent( currentState, 'yes-no-answer' )){
        errorCount ++;
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }

    // We obtain the answer in base of yes or no
    var yesNoAnswer = this.state.recast.firstEntity('yes-no-answer');
    if (yesNoAnswer) {
        //Holder of the value
        var value = undefined;
        var rawString = yesNoAnswer.raw;

        /* we parse the answer */
        if (rawString === 'si' || rawString === 'Si' || rawString === 'SI') {
            value = true;
        } else {
            value = false;
        }

        //Updating the status value
        currentState = firebaseHandler.updateStep(this.message.from.id, currentState, value);

        if( currentState === null ){
            //We reach the end and proceed with the link display
            if( value ){
                //We proceed with the display of the proper link
                this.reply('¡Hemos terminado!\nHaz click en este enlace para ver lo que considero mejor para ti:\n'+
                    sessionHandler.generateBudgetLink( getCurrentUserId( this.message ) ) );
            }else{
                this.reply('¡Parece que es todo por hoy!\nSi quieres tus resultados en un futuro solo pidemelos.')
            }
        }else{
            //We update the current state
            this.reply( sessionHandler.getStepQuestion( currentState ) );
        }
    } else {
        //We show the retry input text
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }
});

/**
 * Handler for the number intent of the application
 * */
recast.onIntent('number-answer', function * () {
    /* we first check if the intent is applicable */
    if( !sessionHandler.stepCanUseIntent( currentState, 'number-answer')){
        errorCount ++;
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }

    // Get first room entity
    var numberAnswer = this.state.recast.firstEntity('number');
    if (numberAnswer) {
        //We save the obtained user value
        currentState = firebaseHandler.updateStep( getCurrentUserId( this.message ), currentState, numberAnswer.value );

        //We handle the response of the next state
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    } else {
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }
});

/**
 * Handler for the area intents of the application
 * */
recast.onIntent('area-size', function * () {
    /* we first check if the intent is applicable */
    if( !sessionHandler.stepCanUseIntent( currentState, 'area-size')){
        errorCount ++;
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }

    // Get the area elements composed by entities
    var areaElements = this.state.recast.allEntities('number');
    if ( areaElements && areaElements.length == 2 ) {
        //We build the elements object
        var areaInfo = {
            width: areaElements[0].value,
            height: areaElements[1].value
        };

        //We save the obtained user value
        currentState = firebaseHandler.updateStep( getCurrentUserId( this.message ), currentState, areaInfo);

        //We handle the response of the next state
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    } else {
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }
});

/**
 * Handler for the floor materials available
 * */
recast.onIntent('floor-material', function * () {
    /* we first check if the intent is applicable */
    if( !sessionHandler.stepCanUseIntent( currentState, 'floor-material' )){
        errorCount ++;
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }

    // Get the floor material
    var floorAnswer = this.state.recast.firstEntity('floor');
    if (floorAnswer) {
        //We save the obtained user value
        currentState = firebaseHandler.updateStep( getCurrentUserId( this.message ), currentState, floorAnswer.value );

        //We handle the response of the next state
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    } else {
        //console.log('Error parsing the floor entity');

        //We setup the fail message
        this.reply(failMessage);
        return this.reply( sessionHandler.getStepQuestion( currentState ) );
    }
});

/**
 * Handler for the number intent of the application
 * */
recast.onMessage(function * () {
    console.log('==== MESSAGE INCOMING ====');
    //console.log( this.message );

    // We try to register the user to the database if it's not set
    firebaseHandler.registerUser(this.message.from, this /* context */);

});

/**
 * Obtains the current user id from the reference
 * */
function getCurrentUserId( message ){
    return message.from.id;
}

telegraf.startPolling();

console.log('Luis ahora te esta escuchando');
console.log('        ."   ".\n' +
                    '\t       |  ___(\n' +
                    '\t       ).\' -(\n' +
                    '\t       )  _/\n'+
                   '\t       .\'_`(\n' +
                  '\t       / ( ,/\n' +
                 '\t       /   \ ) \\.\n' +
                '\t       /\'-./ \ \'.\\)\n' +
                '\t\      \  \'---;\'\n'+
                '\t      |`\  \      \\\n' +
                '\t     / / \  \      \\\n' +
              '\t    / /   / /      _\\/\n'+
             '\t   ( \/   /_/      \   |\n' +
          '\tjgs \_)  (___)       \'._/\n');