// ***********************************************
// commands.js creates various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import 'cypress-file-upload';
import {buildUrl} from './utils.js';
//These functions can be called like "cy.login(...)" and will yeild a result

/**
* Log into Submitty, assumes no one is logged in already and at login page
*
* @param {String} [username=instructor] - username & password of who to log in as
*/
Cypress.Commands.add('login', (username='instructor') => {
    cy.url().should('contain', '/authentication/login');
    cy.get('input[name=user_id]').type(username, {force: true});
    cy.get('input[name=password]').type(username, {force: true});
    cy.waitPageChange(() => {
        cy.get('input[name=login]').click();
    });
});

/**
* Log out of Submitty, assumes a user is already logged in
*/
Cypress.Commands.add('logout', (force = false) => {
    cy.waitPageChange(() => {
        // Click without force fails when a test fails before afterEach
        // https://github.com/cypress-io/cypress/issues/2831#issuecomment-712728988
        cy.get('#logout > .flex-line').click({'force': force});
    });
});

/**
 * Waits for the current page to be changed (does not wait for the `load` event to run).
 * Will continue execution as soon as the current page is changed.
 * Provided by https://github.com/cypress-io/cypress/issues/1805#issuecomment-525482440
 *
 * @param {function} fn - the code to run that should navigate to a new page.
 */
Cypress.Commands.add('waitPageChange', (fn) => {
    cy.window().then(win => {
        win._cypress_beforeReload = true;
    });
    cy.window().should('have.prop', '_cypress_beforeReload', true);
    fn();
    cy.window().should('not.have.prop', '_cypress_beforeReload');
});


/**
* Visit a url either by an array of parts or a completed url E.g:
* cy.vist(['sample', 'gradeables']) -> visit 'courses/s21/sample/gradeables'
* cy.vist('authentication/login') visit 'authentication/login'
*
* base url of localhost:1501 is used by default, see baseUrl in Cypress.json
*
* @param {String|String[]}
*/
Cypress.Commands.overwrite('visit', (originalFn, options) => {
    let url = '';

    if (Array.isArray(options)){
        url = buildUrl(options);
    }
    else if ((typeof options) === 'string'){
        url = options;
    }
    else {
        url = buildUrl([]);
    }

    return originalFn(url);
});

/**
 * Disables the logout for the running test from the global afterEach hook.
 */
Cypress.Commands.add('disableAfterEachLogout', () => {
    cy.wrap(false).as('shouldLogout');
});
