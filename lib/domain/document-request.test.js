const { DocumentRequest } = require('./document-request');
const MockDate = require('mockdate');

describe('domain/DocumentRequest', () => {
  describe('.new()', () => {
    it('creates a new document request', () => {
      const now = '2022-01-01T04:00:00.000Z';
      MockDate.set(now);
      const metadata = {
        firstName: ['Joe'],
        lastName: ['Bloggs'],
        dob: ['1969-02-01 12:00:00'],
        'systemId.jigsaw': ['123']
      };

      const request = DocumentRequest.new(metadata);

      expect(request.id).not.toBeUndefined();
      expect(request.id).toStrictEqual(expect.any(String));
      expect(request.id.length).toBe(8);
      expect(request.metadata).toEqual(metadata);
      expect(request.created).toBe(now);
      expect(request.dropboxId).toBe(null);
    });
  });
});
