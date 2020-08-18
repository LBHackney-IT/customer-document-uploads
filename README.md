# customer-document-uploads
A simple tool to enable Hackney residents to upload documents for Hackney staff to view.

## Initial setup
Once you've cloned this repository, you'll need a few things to get up and
running locally.

1.  First, install the dependencies
    ```bash
    npm install
    ```

2.  Create a `.env` file, based on the `.env.sample` that exists
    ```bash
    touch .env # then go fill it in!
    ```

3.  Then, we need to set up DynamoDB local
    ```bash
    brew cask install java # if you don't already have Java
    npm run dynamo-install
    ```

  
## Running locally
Once you're all set up you can run the application locally, it should start up 
at http://localhost:3000. This will be running using a local version of
DynamoDB and the staging instance of Evidence Store (this is configurable in
the `serverless.yml` file).

```bash
npm run start
```

## Unit tests
Set these values in .env to any string values
```bash
GOV_NOTIFY_API_KEY=
GOV_NOTIFY_TEMPLATE_ID=
```

To run the unit tests (using Jest):
```bash
npm run unit-test
```

## Cypress tests
To run the Cypress tests you'll need to set some configuration for Cypress,
you can do this either with a `cypress.env.json` file or using environment
variables. If you're using a JSON file it should look something like this:

```
{
    "JWT_SECRET": "{{ value of your token secret from .env }}",
    "TEST_ES_TOKEN": "{{ valid Hackney token for Evidence Store }}
}
```

You can run Cypress tests using this command:
```bash
npm run cypress-ui # for dev and debugging, or
npm test # full test run (e.g. in CI)
```

## Deployment
After committing CircleCI will automatically build and test your changes,
this runs all unit and integration tests. The results of these tests will
be reported in your PR and alongside the commit in GitHub.

After merging into `master` CircleCI will deploy the application to a staging
environment, there is a manual approval step for deploying to production.
Manual approval can be provided in CircleCI.
