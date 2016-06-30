#!/usr/bin/env node

'use strict'

const https = require('https')
const Telegraf = require('telegraf')
const TelegrafRecast = require('telegraf-recast')
const firebase = require('firebase')
const firebaseHandler = require('./firebase-handler')

/* init of the firebase instance */
firebase.initializeApp({
  serviceAccount: "Firebase.json",
  databaseURL: "https://cpmx7-hackathon.firebaseio.com/"
})

const telegrafOptions = {
  telegram: {
  agent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 5000,
  }),
  },
}

const TelegrafJS = require('node_modules/telegraf/lib/telegraf')

const telegraf = new Telegraf(process.env.BOT_TOKEN, telegrafOptions)
telegraf.use(Telegraf.memorySession())

const recast = new TelegrafRecast(process.env.RECAST_TOKEN)
telegraf.use(recast.middleware())

//Handling libraries of the Telegraf library
const Extra = TelegrafJS.Extra
const Markup = TelegrafJS.Extra.Markup

//Setting the current state and process to the given user
var currentProcess = undefined;
var currentState = undefined;

/**
 * Handler for the greeting of the user
 * */
recast.onIntent('greeting', function * () {
  /* print of the messages */
  console.log('Intent of greeting');

  //We just simply reply the user answer
  this.reply('¡Hola soy Luis tu asistente de construcción personal!' +
  '\nPara empezar con dime. ¿Qué clase de proyecto quieres realizar? ');

  //We give the chance to the user to select the process to be followed
  this.reply('Keyboard wrap', Extra.markup(
    Markup.keyboard(['Reparar techo', 'Construir un cuarto',
    'Poner piso', 'Instalar loseta'], {columns: parseInt(ctx.match[1])})
  ))
});

/**
 * Handler for the process selection of the application
 * */
recast.onIntent('process-selection', function * () {
  /* print of the messages */
  console.log('Intent of process-selection');
  console.log(this.state.recast.intent);              // first intent
  console.log(this.state.recast.message);
  console.log(this.message);

  // Get first room entity
  var process = this.state.recast.firstEntity('process');

  if( process === 'Construir un cuarto'){
    firebaseHandler.updateProcess( process );

    //We then proceed to the next step in the build room process
  }else{
    this.reply('Por el momento no soportamos ese proceso :C');
    //We give the chance to the user to select the process to be followed
    this.reply('Keyboard wrap', Extra.markup(
      Markup.keyboard(['Reparar techo', 'Construir un cuarto',
      'Poner piso', 'Instalar loseta'], {columns: parseInt(ctx.match[1])})
    ))
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
  console.log('user id: '+ this.message.from.id );
  console.log('==== END OF MESSAGE HANDLING ====');

  // We try to register the user to the database if it's not set
  currentProcess = firebaseHandler.registerUser( this.message.from.id, this /* context */);
});

telegraf.startPolling()

console.log('Bot is listening')
