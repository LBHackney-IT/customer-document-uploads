/// <reference types="cypress" />

context('Staff actions', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  context('when visiting the service', () => {
    it('shows the staff view', () => {
      cy.get('h2').contains(/customer uploads/i);
    });

    it('shows a list of customer dropboxes', () => {
      cy.get('[data-testid=staff-dropboxes-list]')
        .children()
        .should('have.length.greaterThan', 1);
    });
  });

  context('when selecting a customer dropbox', () => {
    it('shows the customer dropbox details', () => {
      cy.get('[data-testid=staff-dropboxes-list]')
        .children()
        .first()
        .find('[data-testid=dropbox-link]')
        .click();

      cy.get('[data-testid=dropbox-details]').should('exist');
    });
  });

  context('when viewing a customer dropbox', () => {
    it('can navigate back to the dropboxes list', () => {
      cy.get('[data-testid=staff-dropboxes-list]')
        .children()
        .first()
        .find('[data-testid=dropbox-link]')
        .click();

      cy.get('[data-testid=dropbox-list-return-link]').click();

      cy.get('[data-testid=staff-dropboxes-list]').should('exist');
    });
  });
});
