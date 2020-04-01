/// <reference types="cypress" />
process.env.stage = 'test';
process.env.DROPBOXES_TABLE = 'customer-document-uploads-test-dropboxes';
const dbConfig = require('../../lib/DynamoDbConfig')(process.env);
const dbConn = require('../../lib/DynamoDbConnection')(dbConfig);
const dbGateway = require('../../lib/gateways/dynamo')(dbConn);
require('cypress-file-upload');

context('Customer Actions', () => {
  const dropboxUrlRegex = /\/dropboxes\/([0-9a-z]{15})/;

  describe('coming to the service', () => {
    context("when the user doesn't have a session", () => {
      it('should redirect a new user to the new dropbox url', () => {
        cy.request({
          url: 'http://localhost:3000/',
          followRedirect: false
        }).then(response => {
          expect(response.status).to.eq(302);
          expect(response.redirectedToUrl).to.eq(
            'http://localhost:3000/dropboxes/new'
          );
        });
      });

      it('should create a new dropbox and redirect the user to it from the new dropbox page', () => {
        cy.request({
          url: 'http://localhost:3000/dropboxes/new',
          followRedirect: false
        }).then(async response => {
          expect(response.status).to.eq(302);

          expect(response.redirectedToUrl).to.match(dropboxUrlRegex);

          const dropboxId = response.redirectedToUrl.match(dropboxUrlRegex)[1];
          const dropbox = await dbGateway.getDropbox(dropboxId);
          expect(dropbox.dropboxId).to.equal(dropboxId);
        });
      });
    });

    context('when the user has a session', () => {
      it('should redirect to their existing dropbox url', () => {
        cy.visit('http://localhost:3000/');
        cy.location()
          .then(loc => {
            return loc.pathname;
          })
          .then(path => {
            cy.visit('http://localhost:3000/');
            cy.location('pathname').should('eq', path);
          });
      });
    });
  });

  describe('submitting documents', () => {
    it('should allow a user to upload a document', () => {
      cy.visit('http://localhost:3000/');
      // cy.get('#newUploadFile')
      cy.get('#newUploadFile[data-cy="file-input"]').attachFile('foo.txt');
      cy.get('#newUploadTitle').type('the description');
      cy.get('#uploadFile').click();

      // expect(cy.get('#uploads')).to.contain('foo.txt');
      cy.get('#uploads').should('contain', 'foo.txt');
    });
  });
});
