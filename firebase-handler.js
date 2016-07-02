'use strict';

const firebase = require('firebase');
const q = require('q');
const sessionHandler = require('./session.handler');

/**
 * Registers the current user in the telegram database
 * */
exports.registerUser = function (user, context) {
    var ref = firebase.database().ref('/users/' + user.id);
    ref.on("value", function (snapshot) {
        var values;
        if (snapshot.val() != null) {
            values = snapshot.val();
        }

        /* object to be saved to firebase if the user is not registered  */
        if (!values) {
            values = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                client: 'telegram',
                process: 'default'
            };

            //We save the instance data in the DB
            firebase.database().ref("/users/" + user.id).set(values);
        } else {
            /* nothing to do */
        }
    }, function (errorObject) {
        //Printing the error object
        context.reply('¡Oh no!, Hubo un error intenta de nuevo');
    });
};

/**
 * Updates the step information for the given case
 */
exports.updateStep = function (userId, stepName, value) {
    //We set the update data for the function
    var updateData = {};
    updateData[stepName] = value;

    // We now try to update the reference of the next step to be processed
    var nextStep = sessionHandler.getNextStep(stepName);
    if( nextStep ){
        updateData.currentState = nextStep;
    }else{
        /* we have reached the end of the file */
        if( nextStep == null ){
            updateData.isComplete = true;
        }
    }

    //We proceed with the update of the reference database
    firebase.database().ref('/users/' + userId + '/stateInfo/').update(updateData);

    //We return the reference of the next step to the ui
    return nextStep;
};
