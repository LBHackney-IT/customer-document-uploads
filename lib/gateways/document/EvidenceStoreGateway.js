const { Document } = require('../../domain/dropbox');
const fetch = require('node-fetch');

class EvidenceStoreGateway {
  constructor({ baseUrl }) {
    console.log('url', { baseUrl });
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
      console.log(response);
      throw new Error('Call to Evidence Store failed.');
    }
  }

  async getByDropboxId(dropboxId) {
    const response = await fetch(`${this.baseUrl}/documents`, {
      body: JSON.stringify({ dropboxId }),
      method: 'POST'
    });

    if (response.ok) {
      const data = await response.json();
      return data.map(
        result =>
          new Document({
            id: result.documentId,
            filename: result.downloadUrl.split('/').reverse()[0],
            description: result.description,
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
