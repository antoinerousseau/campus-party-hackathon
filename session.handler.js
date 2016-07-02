/**
 * Created by mauriciolara on 7/1/16.
 *
 * Hosts the handler of the current session for the user
 */

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
    'beginning' : '¡Hola soy Juan tu asistente de construcción personal!\n' +
    'Por ahora solo tengo información para asesorarte en la construcción de un cuarto\n¿Es la construcción una ampliación?',
    'isRepair': '¿Es la construcción una ampliación?',
    'numberOfRooms': '¿Cuantos cuartos ya tienes en tu casa?',
    'roomSize': '¿Cual es el área del cuarto? (Ejemplo: 4m x 4m)',
    'windowCount': '¿Cuantas ventanas quieres que haya en tu nuevo cuarto?',
    'doorCount': '¿Cuantas puertas deseas que tenga el cuarto?',
    'isPainted': '¿Vas a pintar tu el cuarto?',
    'weeklyIncome': '¿Cual es tu ingreso semanal?',
    'selfBuilt': '¿Lo construyes tu mismo?',
    'end' : '¡Con eso sería todo! ¿Quieres ver mi recomendación?'
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
 * Generates the budget link for the current user
 * */
function generateBudgetLink( userId ){
    return 'https://cpmx7-hackathon.firebaseapp.com/index.html#/budget?userId=' + userId;
}
exports.generateBudgetLink = generateBudgetLink;

/**
 * Obtains the current user id in base of the message object
 * */
/**
 * Obtains the current user id from the reference
 * */
function getCurrentUserId(message) {
    return message.from.id;
}
exports.getCurrentUserId = getCurrentUserId;