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

  const getDropBoxFromUrl = async url => {
    const dropboxId = url.match(dropboxUrlRegex)[1];
    return await dbGateway.getDropbox(dropboxId);
  };

  const getDropBoxFiles = async dropbox => {
    return Object.entries(dropbox.uploads).map(([fileId, file]) => {
      file.fileId = fileId;
      return file;
    });
  };

  const getBucketFile = async (dropboxId, file) => {
    const s3Key = `${dropboxId}/${file.fileId}/${file.fileName}`;
    return await s3Gateway.getFile(s3Key);
  };

  const uploadAFile = (fileName, description) => {
    cy.get('#newUploadFile').attachFile(fileName);
    cy.get('#newUploadTitle').type(description);
    cy.get('#uploadFile').click();
    cy.get('#uploads')
      .should('contain', fileName)
      .should('contain', description);
  };

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

          const dropbox = await getDropBoxFromUrl(response.redirectedToUrl);
          expect(dropbox).to.not.be.undefined;
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
    beforeEach(() => {
      cy.visit('http://localhost:3000/');
    });

    it('should allow a user to upload multiple documents', () => {
      const files = [
        {
          fileName: 'foo.txt',
          description: 'the description',
          contents: 'hello'
        },
        {
          fileName: 'foo2.txt',
          description: 'the second description',
          contents: 'hello again'
        }
      ];

      // upload the files and check they are showing in the ui
      files.forEach((file, i) => {
        uploadAFile(file.fileName, file.description);
      });

      // check the files have been saved correctly
      cy.location().then(async loc => {
        const dropbox = await getDropBoxFromUrl(loc.pathname);
        const dropboxFiles = await getDropBoxFiles(dropbox);

        const filesFromBucket = [];
        for (const dropboxFile of dropboxFiles) {
          const bucketFile = await getBucketFile(
            dropbox.dropboxId,
            dropboxFile
          );
          filesFromBucket.push({
            fileName: dropboxFile.fileName,
            description: dropboxFile.title,
            contents: bucketFile.Body.toString()
          });
        }

        expect(filesFromBucket).to.have.deep.members(files);
      });
    });

    it('should not allow a user to submit the upload form if they have not selected a file', () => {
      cy.get('#uploadFile').click();

      cy.get('#newUploadFile').then($input => {
        expect($input[0].validationMessage).not.to.be.empty;
      });
    });

    it('should not allow a user to submit the upload form if they have not added a file description', () => {
      cy.get('#newUploadFile').attachFile('foo.txt');
      cy.get('#uploadFile').click();

      cy.get('#newUploadTitle').then($input => {
        expect($input[0].validationMessage).not.to.be.empty;
      });
    });

    it('should not show the details form if no files have been uploaded', () => {
      cy.get('#customerName').should('not.exist');
    });

    context('when a file has been uploaded', () => {
      beforeEach(() => {
        uploadAFile('foo.txt', 'this is a foo');
      });

      it('should allow a user to add their details and a description and then submit the form', () => {
        const name = 'Homer Simpson';
        const fileName = 'foo.txt';
        const description = 'These are for my application';

        cy.get('#customerName').type(name);
        cy.get('#customerEmail').type('me@test.com');
        cy.get('#customerPhone').type('123');
        cy.get('#description').type(description);
        cy.get('#submitDropbox').click();

        cy.get('#dropboxContents')
          .should('contain', name)
          .should('contain', description)
          .should('contain', fileName);
      });

      it('should not allow a user to submit the form if they have not entered their name', () => {
        cy.get('#submitDropbox').click();

        cy.get('#customerName').then($input => {
          expect($input[0].validationMessage).not.to.be.empty;
        });
      });

      it('should not allow a user to submit the form if they have not entered a reason for uploading', () => {
        cy.get('#customerName').type('Lisa Simpson');

        cy.get('#submitDropbox').click();

        cy.get('#description').then($input => {
          expect($input[0].validationMessage).not.to.be.empty;
        });
      });
    });

    context('when a dropbox has been submitted', () => {
      beforeEach(() => {
        uploadAFile('foo.txt', 'this is a foo');
        cy.get('#customerName').type('Jonah Lomu');
        cy.get('#customerEmail').type('me@test.com');
        cy.get('#customerPhone').type('123');
        cy.get('#description').type('These are for my wedding');
        cy.get('#submitDropbox').click();
      });

      it('should always navigate to the submitted dropbox', () => {
        cy.visit('http://localhost:3000/');
        cy.location('pathname').should('match', dropboxUrlRegex);
      });

      it('should allow the user to start again', () => {
        cy.get('#startAgain').click();
        cy.location('pathname').should('match', dropboxUrlRegex);
      });
    });
  });
});
