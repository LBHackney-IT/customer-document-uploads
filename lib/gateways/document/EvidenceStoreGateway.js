const fetch = require('node-fetch');

class EvidenceStoreGateway {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  async createUploadUrl(dropboxId) {
    const response = await fetch(`${this.baseUrl}/metadata`, {
      body: JSON.stringify({ dropboxId }),
      method: 'POST'
    });

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.url,
        fields: data.fields,
        documentId: data.documentId
      };
    } else {
      throw new Error('Call to Evidence Store failed.');
    }
  }
}

module.exports = EvidenceStoreGateway;
