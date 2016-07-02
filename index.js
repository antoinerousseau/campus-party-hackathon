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

const telegraf = new Telegraf(process.env.BOT_TOKEN, telegrafOptions);

const recast = new TelegrafRecast(process.env.RECAST_TOKEN);
telegraf.use(recast.middleware());

//Setting the current state of the user
var currentState = {};
var defaultState = 'beginning';
var errorCount = 0;
var failMessage = 'Parece que esa no es la respuesta que busco ahora';

/**
 * Handler for the greeting of the user
 * */
recast.onIntent('greeting', function * () {
    console.log('greeting');

    //Getting the current user id
    var currentUserId = sessionHandler.getCurrentUserId( this.message );
    currentState[ currentUserId ] = defaultState;

    /* we first check if the intent is applicable */
    if (!sessionHandler.stepCanUseIntent(currentState[ currentUserId ])) {
        errorCount++;
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }

    //We send the init message
    this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));

    //We update the step of the user
    currentState[ currentUserId ] = firebaseHandler.updateStep( currentUserId, currentState[ currentUserId ], '');

    //We send a greeting picture
    telegraf.sendPhoto(this.message.chat.id,
        {
            url: 'https://cpmx7-hackathon.firebaseapp.com/chatimg/greeting.png',
            filename: 'greeting.png'
        });
});

/**
 * Handler for the yes/no answers in the process
 * */
recast.onIntent('yes-no-answer', function * () {
    console.log('yes no answer');
    var currentUserId = sessionHandler.getCurrentUserId( this.message );

    if( !currentState[ currentUserId ] ){
        /* do nothing, there seems to be a bug with the Recast AI */
        return;
    }

    /* we first check if the intent is applicable */
    if (!sessionHandler.stepCanUseIntent(currentState[ currentUserId ], 'yes-no-answer')) {
        errorCount++;
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }

    /* we try to find if there's a yes or a no declaration */
    var yesAnswer = this.state.recast.firstEntity('yes-answer');
    var noAnswer = this.state.recast.firstEntity('no-answer');

    /* validating if the user is trying to confuse us LOL */
    if( yesAnswer && noAnswer || ( !yesAnswer && !noAnswer ) ){
        this.reply('Parece que no estas seguro, intententemos ser más concisos');
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }else{
        /* we define the kind of answer */
        var value = ( yesAnswer ? true : false );

        //Updating the status value
        currentState[ currentUserId ]= firebaseHandler.updateStep( currentUserId, currentState[ currentUserId ], value);

        if (currentState[ currentUserId ] === null) {
            //We reach the end and proceed with the link display
            if (value) {
                //We proceed with the display of the proper link
                this.reply('¡Hemos terminado!\nHaz click en este enlace para ver lo que considero mejor para ti:\n' +
                    sessionHandler.generateBudgetLink(currentUserId));
            } else {
                this.reply('¡Parece que es todo por hoy!\nSi quieres tus resultados en un futuro solo pidemelos.')
            }
        } else {
            //We update the current state
            this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
        }
    }
});

/**
 * Handler for the number intent of the application
 * */
recast.onIntent('number-answer', function * () {
    console.log('number-answer');
    var currentUserId = sessionHandler.getCurrentUserId( this.message );

    /* we first check if the intent is applicable */
    if (!sessionHandler.stepCanUseIntent(currentState[ currentUserId ], 'number-answer')) {
        errorCount++;
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }

    // Get first room entity
    var numberAnswer = this.state.recast.firstEntity('number');
    if (numberAnswer) {
        //We save the obtained user value
        currentState[ currentUserId ]= firebaseHandler.updateStep( currentUserId, currentState[ currentUserId ], numberAnswer.value);

        //We handle the response of the next state
        if (currentState[ currentUserId ] == 'roomSize') {
            /* we display a helper image with the dimensions */
            telegraf.sendPhoto(this.message.chat.id,
                {
                    url: 'https://cpmx7-hackathon.firebaseapp.com/chatimg/room.jpeg',
                    filename: 'room.jpeg'
                });
        }

        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    } else {
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }
});

/**
 * Handle the start intent
 * */
recast.onIntent('start', function * (){
   console.log('start...');
});

/**
 * Handler for the area intents of the application
 * */
recast.onIntent('area-size', function * () {
    console.log('area-size');
    var currentUserId = sessionHandler.getCurrentUserId( this.message );

    /* we first check if the intent is applicable */
    if (!sessionHandler.stepCanUseIntent(currentState[ currentUserId ], 'area-size')) {
        errorCount++;
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }

    // Get the area elements composed by entities
    var areaElements = this.state.recast.allEntities('number');
    if (areaElements && areaElements.length == 2) {
        //We build the elements object
        var areaInfo = {
            width: areaElements[0].value,
            height: areaElements[1].value
        };

        //We save the obtained user value
        currentState[ currentUserId ] = firebaseHandler.updateStep( currentUserId, currentState[ currentUserId ], areaInfo);

        //We handle the response of the next state
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    } else {
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }
});

/**
 * Handler for the floor materials available
 * */
recast.onIntent('floor-material', function * () {
    console.log('floor-material');
    var currentUserId = sessionHandler.getCurrentUserId( this.message );

    /* we first check if the intent is applicable */
    if (!sessionHandler.stepCanUseIntent(currentState[ currentUserId ], 'floor-material')) {
        errorCount++;
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }

    // Get the floor material
    var floorAnswer = this.state.recast.firstEntity('floor');
    if (floorAnswer) {
        //We save the obtained user value
        currentState[ currentUserId ] = firebaseHandler.updateStep(currentUserId, currentState[ currentUserId ], floorAnswer.value);

        //We handle the response of the next state
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    } else {
        //console.log('Error parsing the floor entity');

        //We setup the fail message
        this.reply(failMessage);
        return this.reply(sessionHandler.getStepQuestion(currentState[ currentUserId ]));
    }
});

/**
 * Handler for the number intent of the application
 * */
recast.onMessage(function * () {
    console.log('==== MESSAGE INCOMING ====');
    console.log('Message Intent type: ');

    // We try to register the user to the database if it's not set
    firebaseHandler.registerUser(this.message.from, this /* context */);
});

//Init of the polling of telegram messages
telegraf.startPolling();

console.log('Luis ahora te esta escuchando');
console.log('        ."   ".\n' +
    '\t       |  ___(\n' +
    '\t       ).\' -(\n' +
    '\t       )  _/\n' +
    '\t       .\'_`(\n' +
    '\t       / ( ,/\n' +
    '\t       /   \ ) \\.\n' +
    '\t       /\'-./ \ \'.\\)\n' +
    '\t\      \  \'---;\'\n' +
    '\t      |`\  \      \\\n' +
    '\t     / / \  \      \\\n' +
    '\t    / /   / /      _\\/\n' +
    '\t   ( \/   /_/      \   |\n' +
    '\tjgs \_)  (___)       \'._/\n');