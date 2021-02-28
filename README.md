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

### Deploying to Loki
The production build of your application, located in the `dist` directory by default, can be manually deployed to a page in a Loki OS application by running `npm run loki` from the command line. In order to properly deploy your code, update the following information in `package.json`:

```
"appInfo": {
    "loki": {
      "appCodeName": "The URN segment identifying the Loki app that you plan to deploy to (the last segment of loki.app.rootUrn)",
      "pageCodeName": "The page in Loki's App Builder that you plan to deploy to",
      "cloudPrefix": "The subdomain of your cloud's url",
      "cloudCodeName": "The name of your cloud environment",
      "pageName": "The name of the page (the page title)"
    }
  },
```
Please make sure you update this information correctly, since it will be used to construct the API endpoints for deploying your code. It is recommended to set up a page in Loki’s App Builder (along with an appropriate security model) for your Vue app to deploy to **before** configuring your Vue app.

#### Environment variables
Deploying to Loki requires providing access to valid Loki credentials via environment variables. Add a [.env file to your project root and use dotenv](https://github.com/motdotla/dotenv#readme) to accomplish this. For saving the compiled application to the Loki cloud, you need to set the following `.env` variables:  `LOKI_USER_URN`, `LOKI_USERNAME` and `LOKI_PASSWORD` as your variable names. For testing purposes, you need to be able to run API enpoint calls to a CaseMaker cloud; in the case, you need an `.env` variable called `LOKI_TEST_CLOUDNAME`.


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
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
 

