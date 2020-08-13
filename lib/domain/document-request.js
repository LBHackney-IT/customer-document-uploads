const { nanoid } = require('nanoid');

class DocumentRequest {
  constructor({ id, created, dropboxId, metadata }) {
    this.id = id;
    this.created = created;
    this.dropboxId = dropboxId;
    this.metadata = metadata;
  }

  static create(metadata) {
    return new DocumentRequest({
      id: nanoid(8),
      created: new Date(Date.now()).toISOString(),
      dropboxId: null,
      metadata
    });
  }
}

module.exports = { DocumentRequest };
