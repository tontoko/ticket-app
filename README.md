
# setup for local

## Set Env

- windows

  - ```bash
    $env:GOOGLE_APPLICATION_CREDENTIALS="[YOUR FIREBASE ADMIN CREDENCIAL FILE]"
    $env:STRIPE_APIKEY_DEV="[YOUR STRIPE API KEY FOR TEST]"
    ```

- linux

  - ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="[YOUR FIREBASE ADMIN CREDENCIAL FILE]"
    export STRIPE_APIKEY_DEV="[YOUR STRIPE API KEY FOR TEST]"
    ```

- locate your Firebase config file on project root and rename it "ticket-app.ts"

## Start firebase emulators

```bash
firebase emulators:start
```

## Start local server

```bash
npm run dev
```

