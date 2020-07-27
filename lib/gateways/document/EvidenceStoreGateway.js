const { Document } = require('../../domain/dropbox');
const fetch = require('node-fetch');

class EvidenceStoreGateway {
  constructor({ baseUrl, authorizationToken }) {
    this.baseUrl = baseUrl;
    this.authorizationToken = authorizationToken;
  }

  buildHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authorizationToken}`
    };
  }

  async createUploadUrl(dropboxId) {
    const response = await fetch(`${this.baseUrl}/metadata`, {
      body: JSON.stringify({ dropboxId }),
      headers: this.buildHeaders(),
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
      console.log(response);
      throw new Error('Call to Evidence Store failed.');
    }
  }

  async getByDropboxId(dropboxId) {
    const response = await fetch(`${this.baseUrl}/search`, {
      body: JSON.stringify({ dropboxId }),
      headers: this.buildHeaders(),
      method: 'POST'
    });

    if (response.ok) {
      const { documents } = await response.json();
      return documents.map(
        result =>
          new Document({
            id: result.metadata.documentId,
            filename: (result.downloadUrl || '').split('/').reverse()[0],
            description: result.metadata.description,
            downloadUrl: result.downloadUrl
          })
      );
    } else {
      console.log(response);
      throw new Error('Call to Evidence Store failed.');
    }
  }
}

module.exports = EvidenceStoreGateway;
