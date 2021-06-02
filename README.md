# Loki Vue 3 + Vite Starter

Loki Vue 3 + Vite Starter is a simple way to fast-forward through the setup of a fresh Vue 3 app that can be easily deployed to Sapling Data’s Loki cloud OS. This app has been initialized with [Vite](https://vitejs.dev/) and includes basic setups for [Jest](https://jestjs.io/docs/en/getting-started) and [Tailwind CSS](https://tailwindcss.com/docs).

## Installation

Click the “Use the template” button at the top of the repository’s GitHub page to create a new repository using the starter.

After your new repository has been cloned, run
```node
npm install
```
to install the necessary packages.

## Usage

This starter has already been initialized with the following packages and tools:

:white_check_mark: Vue 3
:white_check_mark: Babel
:white_check_mark: Vue Router (included but not configured)
:white_check_mark: Vuex (included but not configured)
:white_check_mark: Linting on save using ESLint and the Airbnb style guide
:white_check_mark: Unit testing with Jest


⚙️ Because setups for Vue Router and Vuex will vary from project to project, these packages are included but not configured. You will need to determine your own routing and state management needs and configure those tools accordingly.

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
An example test is included by default to ensure that Jest is functional/properly installed. You are responsible for writing the rest of the tests for your application.
```
npm run test:unit
```
If you would like to add E2E tests, it is recommended that you add a `test:e2e` script command that will run with a `jest.e2e.config.js` file. Since component tests are common in Vue development, the `test:unit` command is included by default.
### Lints and fixes files
Linting is currently working in VS Code. Your file will be linted and fixed on save. See the [ESLint docs](https://eslint.org/) to learn how to configure lint for your particular needs.

### Deploying to Loki and Environment Variables
The production build of your application, located in the `dist` directory by default, can be manually deployed to a page in a Loki OS application by running `npm run loki` from the command line. In order to properly deploy your code, you must specify an `.env` file. All varibles beginning in `VITE_` will be exposed as `import.meta.env.VITE_` to your client source code according to the Vite API at [Env Variables and Modes](https://vitejs.dev/guide/env-and-mode.html#env-files). Deploying to Loki requires providing access to valid Loki credentials via environment variables. Read more about `.env` files [here](https://github.com/motdotla/dotenv#readme). Also note that the env variables in your GitHub actions definition need to match the .env file. See `.github/workflows/node.js.yml`

```
.env

LOKI_USERNAME               # Loki username
LOKI_PASSWORD               # Loki password
LOKI_USER_URN               # Full loki user URN (for saving uploaded data)
VITE_CLOUD_CODE_NAME        # The URN segment identifying the Loki app that you plan to deploy to (the last segment of loki.app.rootUrn)
VITE_CLOUD_CODE_NAME_TEST   # The code name of the development environment app (used with server in vite.config.js)
VITE_APP_CODE_NAME          # The code name of the app to which the code will be deployed
VITE_PAGE_NAME              # The name of the page (the <title> block)
VITE_PAGE_CODE_NAME         # The code name of the page
VITE_PG_DATASPACE           # The urn of the default dataspace for the app
```

Please make sure you update this information correctly, since it will be used to construct the API endpoints for deploying your code. It is recommended to set up a page in Loki’s App Builder (along with an appropriate security model) for your Vue app to deploy to **before** configuring your Vue app.

:warning: **DO NOT CHECK YOUR `.env` FILE INTO VERSION CONTROL** :warning:
The starter’s `.gitignore` file is set up to ignore `.env` files by default; do not change this.

#### GitHub Actions
The `loki` command can be directly run from the command line or used as part of a GitHub Actions build process. A basic GitHub Actions workflow YAML file has been included in this repository. By default, this workflow is set up to run on a push to the `main` branch. [This workflow can be customized](https://docs.github.com/en/actions) to suit your own development process and deployment needs. The trigger definition is commented out by default to prevent accidental use:

```
# Uncomment the lines below to enable the workflow.
# on:
#   push:
#     branches: [ main ]
```

Actions will fail until these lines are uncommented.

Note: GitHub Actions offers a limited number of build minutes per month for free accounts. Please make sure that you are aware of your limit if you haven’t used GitHub Actions before.

### Writing queries
Any `.SQL` file added to `./src/queries` will be added as a child query to a query object saved in the cloud with the URN `urn:com:[VITE_CLOUD_CODE_NAME]:[VITE_APP_CODE_NAME]:model:queries:[VITE_PAGE_CODE_NAME]`. Each `.SQL` file should have a YAML head as follows:

```
---
name: [REQUIRED: URN-compliant name of the child query]
dataSpaceUrn: [REQUIRED: URN OF THE DATASPACE FOR THE QUERY, E.G., "urn:com:cloud:app:model:dataSpaces:testapp_dw"]
queryParams: [OPTIONAL: OBJECT WITH QUERY PARAMETER DEFINITIONS, E.G., {testParam: "urn:com:loki:core:model:types:string"}]
---
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
 


