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

Full instructions can be found on the [github wiki](https://github.com/cclloyd/planeshift/wiki/Setup)

## NodeJS

If you want to just run by cloning this repo, you can run `yarn build`, then `yarn start:prod:local` to run the production build. A `.env` file can be provided in the current directory to load environment variables.

## Authentication

Discord and generic OIDC providers are supported.  You can also run without authentication, though that's not recommended.

More info on setting up an authentication provider can be found on the [github wiki](https://github.com/cclloyd/planeshift/wiki/Authentication)

## Reverse Proxy

Running behind a proxy is fully supported.  All endpoints are under `/api`, making it convenient to route using the same hostname your foundry instance is hosted on.

Whatever hostname/protocol you set for your proxy, you should also set the variable `EXTERNAL_URL` to match (excluding `/api`)

## Full Configuration

Most of the API is configured via environment variables. A `.env` file will be loaded automatically if found.

Full configuration reference can be found on the [github wiki](https://github.com/cclloyd/planeshift/wiki/Configuration)

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