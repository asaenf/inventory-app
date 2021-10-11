## Firebase cloud functions

### emulators

`functions/ firebase emulators:start`

Note: Uncomment firebase.functions().useFunctionsEmulator in FirebaseFunctions.js

### deploy

`firebase deploy --only functions`

## React app

### Code format

`npx prettier --write .`

### `npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

It will run with the properties in env.development environment file

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### Production build

Main instance: `npm run build:smido`

Aspoja instance: `npm run build:aspoja`

Tannas instance: `npm run build:tannas`

### Production deploy firebase hosting

TARGET_NAME is either smido, aspoja or tannas

`firebase deploy --only hosting:TARGET_NAME`

Note that all builds output to /build so you can only deploy the latest built instance, not all in one go.
