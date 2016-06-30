'use strict'

const firebase = require('firebase')

/**
 * Registers the current user in the telegram database
 * */
exports.registerUser = (userId, context ) => {
  var ref = firebase.database().ref('/users/' + userId);
  ref.on("value", function(snapshot) {
    var values = {};
    if (snapshot.val() != null) {
      values = snapshot.val();
    }

    //We set the reference of the current process
    var currentProcess = ( values.process ? values.process : 'default' );

    /* object to be saved to firebase */
    var values = {
      id : userId,
      client: 'telegram',
      process: currentProcess
    };

    //We save the instance data in the DB
    firebase.database().ref("/users/" + userId).set(values);

    //We return the current process information
    return currentProcess;
  }, function (errorObject) {
    //Printing the error object
    console.log( errorObject );

    context.reply('¡Oh no!, Hubo un error intenta de nuevo');
  });
}

/**
* Updates the process reference for the given user
*/
exports.updateProcess = ( userId, process, context ) => {
  var ref = firebase.database().ref('/users/' + userId);
  ref.on("value", function(snapshot) {
    var values = {};
    if (snapshot.val() != null) {
      values = snapshot.val();
    }

    /* we update the reference for the given step */
    var values = {};
    values.process = value;

    firebase.database().ref('/users/' + userId).set( values );
  }, function (errorObject) {
    //Printing the error object
    console.log( errorObject );

    context.reply('¡Oh no!, Hubo un error intenta de nuevo');
  });
}

/**
* Updates the step information for the given case
*/
exports.updateStep = ( userId, stepName, value, context ) => {
  var ref = firebase.database().ref('/users/' + userId + '/stateInfo/');
  ref.on("value", function(snapshot) {
    var values = {};
    if (snapshot.val() != null) {
      values = snapshot.val();
    }

    /* we update the reference for the given step */
    var values = {};
    values[ stepName ] = value;

    firebase.database().ref('/users/' + userId + '/stateInfo').set( values );
  }, function (errorObject) {
    //Printing the error object
    console.log( errorObject );

    context.reply('¡Oh no!, Hubo un error intenta de nuevo');
  });
}
