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
      throw new Error('Call to Evidence Store failed');
    }
  }

  async resolveDownloadUrl(downloadUrl) {
    const response = await fetch(`${downloadUrl}?redirect=false`, {
      method: 'GET',
      headers: this.buildHeaders()
    });

    if (response.ok) {
      const { downloadUrl } = await response.json();
      return downloadUrl;
    } else {
      console.log(response);
      throw new Error('Call to Evidence Store failed');
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

      console.log(
        `Found ${documents.length} documents`,
        JSON.stringify(documents)
      );

      return documents.map(
        result =>
          new Document({
            id: result.metadata.documentId,
            filename: result.metadata.filename,
            description: result.metadata.description,
            downloadUrl: `${this.baseUrl}/${result.metadata.documentId}/contents`
          })
      );
    } else {
      console.log(response);
      throw new Error('Call to Evidence Store failed');
    }
  }
}

module.exports = EvidenceStoreGateway;
