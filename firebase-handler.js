'use strict';

const firebase = require('firebase');
const q = require('q');

/**
 * Definition of the steps of the builder
 * */
var steps = [
    'beginning',
    'isRepair',
    'numberOfRooms',
    'roomSize',
    'windowCount',
    'doorCount',
    'isPainted',
    'weeklyIncome',
    'selfBuilt',
    'end'
];

/**
 * Declarations of the intents that can be handled in a given state
 * */
var intentsOfState = {
    'beginning' : undefined,
    'isRepair': 'yes-no-answer',
    'numberOfRooms': 'number-answer',
    'roomSize': 'area-size',
    'windowCount': 'number-answer',
    'doorCount': 'number-answer',
    'isPainted': 'yes-no-answer',
    'weeklyIncome': 'number-answer',
    'selfBuilt' : 'yes-no-answer',
    'end': 'yes-no-answer'
};

/**
 * Declarations of the intents that can be handled in a given state
 * */
var questionsForState = {
    'beginning' : '¡Hola soy Luis tu asistente de construcción personal!\n' +
    'Por ahora solo tengo información para asesorarte en la construcción de un cuarto',
    'isRepair': '¿Es la construcción una ampliación?',
    'numberOfRooms': '¿Cuantos cuartos posee la casa?',
    'roomSize': '¿Cual es el área del cuarto? (Ejemplo: 4m x 4m)',
    'windowCount': '¿Cuantas ventanas deseas que tenga el cuarto?',
    'doorCount': '¿Cuantas puertas deseas que tenga el cuarto?',
    'isPainted': '¿Deseas pintar el cuarto?',
    'weeklyIncome': '¿Cual es tu ingreso semanal?',
    'selfBuilt': '¿Lo construyes tu mismo?',
    'end' : '¿Deseas imprimir tu información?'
};

/**
 * Gets the question to be asked for the current step
 * */
function getStepQuestion( stepName ){
    /* we validate if we are at the end of the chain */
    return questionsForState[ stepName ];
}
exports.getStepQuestion = getStepQuestion;


/**
 * Validates if the intent is valid for the current step
 * */
function stepCanUseIntent(step, intent) {
    return intentsOfState[ step ] === intent;
}
exports.stepCanUseIntent = stepCanUseIntent;

/**
 * Provides the next step in the sequence
 * */
function getNextStep(step) {
    var indexOfStep = steps.indexOf(step);

    /* we first check if the step is a valid one */
    if (indexOfStep === -1) {
        return undefined; // Invalid step given
    }

    if (indexOfStep < steps.length - 1) {
        return steps[indexOfStep + 1];
    } else {
        /* we have reached the end of the step pile */
        return null;
    }
}
exports.getNextStep = getNextStep;

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
    var nextStep = getNextStep(stepName);
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
