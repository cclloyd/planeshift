<p align="center">
  <img src="https://raw.githubusercontent.com/cclloyd/planeshift/refs/heads/main/src/resources/images/logo-full.webp" width="120" alt="PlaneShift Logo" />
</p>

<p align="center">A REST API to make a FoundryVTT instance more accessible outside the game.</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT" ><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg" alt="MIT License"/></a>
  <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/cclloyd/planeshift/build.yaml">
  <img alt="GitHub Tag" src="https://img.shields.io/github/v/tag/cclloyd/planeshift?label=Release&color=0480C5">
</p>

## Description

**PlaneShift** is a REST API layer that connects to a running FoundryVTT instance, allowing you to access the game data in other apps easily.

Discord and OIDC authentication are included by default, making it relatively simple to allow only your game users access to the API.

For the API to be able to connect to your instance, you will need to create a player in the game, preferably called `APIUser` (case-sensitive) and a password. You *can* use your existing GM account if you wish, but you and the API can't be logged in at the same time.  For this reason, it's recommended to create a dedicated user for the API.

### Key Features
- OIDC/Discord authentication
- API Keys for external services to access the API
- Supports FoundryVTT v12, possibly other versions (untested)
- Full docker support

# Deployment

## Docker (recommended)

A mostly ready to go [docker-compose.yml](./docker-compose.yml) file is provided.

- Generate a secret key by running `docker compose run --rm planeshift gen_secret`. 
- Fill in required env vars in compose file. You will need:
  - The Secret key we just generated.
  - A URL that the API will be accessed by.  This will be the only hostname that will be able to authenticate with OIDC.
    - API keys can still be used with any URL.
  - A valid database connection.  A mongo sample is provided if you want to just host one locally.
    - If you use a preexisting mongo instance, you will need to create a user and give them access to a database for the API.
  - A valid foundry instance URL and password.  The default username is APIUser.
  - Valid setup for an auth strategy.
- Run `docker compose up -d`.

If all is set up properly, you should be able to access it at whatever EXTERNAL_URL you set.

## NodeJS

If you want to just run by cloning this repo, you can run `yarn build`, then `yarn start:prod:local` to run the production build. A `.env` file can be provided in the current directory to load environment variables.

## Authentication

### Discord

- Go to the [Discord developer portal](https://discord.com/developers/applications)
- Create an application.  Name it whatever you wish, `FoundryAPI` for example.
- Click on your new application and go to OAuth2.
- Take note of your client ID and secret to copy into `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` env vars.
- Add a redirect URL.  This is in the format of `${EXTERNAL_URL}/api/auth/discord/callback`
- Be sure to save any changes.

To get IDs for your server and roles, go to `User Settings > Advanced > Developer Mode` and switch it to true. This adds a `Copy ID` menu to a lot of discord items.

- Right click on your server and copy the ID and put it in `DISCORD_GUILD_ID`
- Click on a user with the role you want, then right click the role in the popup panel and paste it into one or more of:
  - `DISCORD_ROLE_ID`: This is recommended but not required. Without it, anyone in the server will be able to login to your API instance.
  - `DISCORD_GM_ROLE_ID`: Without this, anyone who authenticates will be considered a GM.
  - `DISCORD_ADMIN_ROLE_ID`: Without this, anyone who authenticates will be considered an admin in the API. Admins bypass all restrictions.
  - You can use the same value for multiple of these variables.

### OpenID Connect

Generic OIDC is supported thanks to [passport-openidconnect](https://www.npmjs.com/package/passport-openidconnect). This has been fully tested with `Keycloak` as a provider, but should work with any compliant OIDC provider.

- You will need a client ID and secret.
- You may need to adjust your scopes and role claim to suit your needs.


## Reverse Proxy

Running behind a proxy is fully supported.  All endpoints are under `/api`, making it convenient to route using the same hostname your foundry instance is hosted on.

Whatever hostname/protocol you set for your proxy, you should also set the variable `EXTERNAL_URL` to match (excluding `/api`)

## Full Configuration

Most of the API is configured via environment variables. A `.env` file will be loaded automatically if found.

| Environment Variable    | Description                                                                                                          | Default                 |
|-------------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------|
| EXTERNAL_URL            | Public facing URL of the container.  Required for the auth callbacks to work properly.                               | `http://localhost:3000` |
| SECRET_KEY              | Secret key for sessions/authentication                                                                               | `null`                  |
|                         |                                                                                                                      |                         |
| MONGO_HOST              | MongoDB server hostname or IP address                                                                                | `localhost`             |
| MONGO_PORT              | MongoDB server port                                                                                                  | `27017`                 |
| MONGO_USER              | MongoDB username                                                                                                     | `planeshift`            |
| MONGO_PASS              | MongoDB password                                                                                                     | `CHANGEME`              |
| MONGO_DB                | MongoDB database name                                                                                                | `planeshift`            |
|                         |                                                                                                                      |                         |
| FOUNDRY_HOST            | Foundry VTT instance URL                                                                                             | `null`                  |
| FOUNDRY_USER            | Username to log into Foundry VTT game                                                                                | `null`                  |
| FOUNDRY_PASS            | Password to log into Foundry VTT game                                                                                | `null`                  |
| FOUNDRY_ADMIN_PASS      | (Optional) Admin password for extra Foundry instance management                                                      | `null`                  |
| FOUNDRY_LOG_ENABLED     | Enable Foundry browser console logging                                                                               | `false`                 |
|                         |                                                                                                                      |                         |
| AUTH_STRATEGY           | Method to use for authentication with the API. <br> *Currently supported methods are:* `discord`, `oidc`, `disabled` | `discord`               |
|                         |                                                                                                                      |                         |
| DISCORD_CLIENT_ID       | Discord application Client ID                                                                                        | `null`                  |
| DISCORD_CLIENT_SECRET   | Discord application Client Secret                                                                                    | `null`                  |
| DISCORD_GUILD_ID        | Discord server ID for authentication                                                                                 | `null`                  |
| DISCORD_ROLE_ID         | Discord Role ID required for API access                                                                              | `null`                  |
| DISCORD_GM_ROLE_ID      | Discord GM Role ID (if omitted, all users will be considered GMs)                                                    | `null`                  |
| DISCORD_ADMIN_ROLE_ID   | Discord Admin Role ID (if omitted, all users will be admins in API, bypassing restrictions)                          | `null`                  |
|                         |                                                                                                                      |                         |
| OIDC_ISSUER             | Issuer URL of the OIDC provider. The configuration should be at `${issuer}/.well-known/openid-configuration`         | `null`                  |
| OIDC_CLIENT_ID          | OpenID Connect authentication Client ID                                                                              | `null`                  |
| OIDC_CLIENT_SECRET      | OpenID Connect authentication Client Secret                                                                          | `null`                  |
| OIDC_EXTRA_SCOPES       | Extra scopes you might need for your auth provider. `openid email profile` is always included.                       | `null`                  |
| OIDC_USERNAME_ATTRIBUTE | Attribute to use for the username.                                                                                   | `preferred_username`    |
| OIDC_ROLE_CLAIM         | Claim name to get roles to define levels of user auth                                                                | `groups`                |
| OIDC_GM_ROLE            | Role/group of users that are considered GM                                                                           | `null`                  |
| OIDC_ADMIN_ROLE         | Role/group of users that are considered API admins.  They bypass all permission restrictions.                        | `null`                  |

# Contributing

## Project setup

Simply clone the project and run

```bash
$ yarn install
```

## Compile and run the project

```bash
$ yarn run start:dev
```
You'll still need a few basic environment variables for it to launch properly, like a database connection, and a secret key.

The easiest way is to create a `.env` file with the values you need.

## Core Technologies

- [NestJS](https://nestjs.com/): For API framework
- [Puppeteer](https://pptr.dev/): Headless browser manipulation for the running foundry game
- [fvtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types): FoundryVTT Typescript type library, courtesy of League of Foundry Developers
- [passport.js](https://www.passportjs.org/): Authentication library