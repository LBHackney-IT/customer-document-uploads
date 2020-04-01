/// <reference types="cypress" />

process.env.stage = 'test';
process.env.DROPBOXES_TABLE = 'customer-document-uploads-test-dropboxes';
process.env.UPLOADS_BUCKET = 'customer-document-uploads-test-uploads';
const dbConfig = require('../../lib/DynamoDbConfig')(process.env);
const dbConn = require('../../lib/DynamoDbConnection')(dbConfig);
const dbGateway = require('../../lib/gateways/dynamo')(dbConn);
const s3Config = require('../../lib/s3Config')(process.env);
const s3Gateway = require('../../lib/gateways/s3')(s3Config);
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
      const file = 'foo.txt';
      const desc = 'the description';

      cy.visit('http://localhost:3000/');
      cy.get('#newUploadFile').attachFile(file);
      cy.get('#newUploadTitle').type(desc);
      cy.get('#uploadFile').click();

      cy.get('#uploads')
        .should('contain', file)
        .should('contain', desc);

      cy.location().then(async loc => {
        const dropboxId = loc.pathname.match(dropboxUrlRegex)[1];
        const dropbox = await dbGateway.getDropbox(dropboxId);
        console.log(dropbox.uploads);

        const key = Object.keys(dropbox.uploads)[0];
        const fileName = Object.values(dropbox.uploads)[0].fileName;

        const bucketFile = await s3Gateway.getFile(dropboxId);

        //expect(bucketFile.dropboxId).to.equal(dropboxId);
      });
    });
  });
});
