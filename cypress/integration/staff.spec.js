/// <reference types="cypress" />

context('Staff actions', () => {
  context('given that the user has a token', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/');
    });

    it('shows the staff view', () => {
      cy.get('h2').contains(/customer uploads/i);
    });

    it('shows a list of customer dropboxes', () => {
      cy.get('[data-testid=staff-dropboxes-list]')
        .children()
        .should('have.length.greaterThan', 1);
    });
  });
});
