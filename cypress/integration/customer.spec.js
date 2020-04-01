/// <reference types="cypress" />

context('Customer Actions', () => {
  describe('coming to the service', () => {
    context("when the user doesn't have a session", () => {
      it('should redirect a new user to the new dropbox url', () => {
        cy.request({url: 'http://localhost:3000/', followRedirect: false}).then(response => {
          expect(response.status).to.eq(302)
          expect(response.redirectedToUrl).to.eq('http://localhost:3000/dropboxes/new')
        })
      })

      it('should create a new dropbox and redirect the user to it from the new dropbox page', () => {
        cy.request({url: 'http://localhost:3000/dropboxes/new', followRedirect: false}).then(response => {
          expect(response.status).to.eq(302)
          expect(response.redirectedToUrl).to.match(/\/dropboxes\/[0-9a-z]{15}/)
        })
      })
    });

    context("when the user has a session", () => {
      it('should redirect to their existing dropbox url', () => {
        cy.visit('http://localhost:3000/')
        cy.location().then(loc => {
          return loc.pathname;
        }).then(path => {
          cy.visit('http://localhost:3000/')
          cy.location('pathname').should('eq', path);
        })
      })
    });
  });
  describe('submitting documents', () => {

  });
});