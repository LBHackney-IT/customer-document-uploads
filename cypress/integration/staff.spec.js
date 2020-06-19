/// <reference types="cypress" />

context('Staff actions', () => {
  context('when not logged in', () => {
    beforeEach(() => {
      cy.logout();
    });

    it('redirects to the login page', () => {
      cy.visit('/dropboxes');
      cy.location('pathname').should('equal', '/login');
    });
  });

  context('when logged in as a staff member', () => {
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
          .eq(2)
          .find('[data-testid=dropbox-link]')
          .click();

        cy.get('[data-testid=dropbox-details]')
          .should('contain', 'Benefits claim reference number:')
          .and('contain', 'Email:')
          .and('contain', 'Date of Birth:')
          .and('contain', 'National Insurance number:');

        cy.get('[data-testid=reference-number-value]').should('contain', '222');
        cy.get('[data-testid=email-value]').should('contain', 'me@test.com');
        cy.get('[data-testid=dob-value]').should('contain', '1999-12-31');
        cy.get('[data-testid=national-insurance-value]').should(
          'contain',
          'AB111111C'
        );
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
});
