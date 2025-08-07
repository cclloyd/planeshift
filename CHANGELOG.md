# v0.1.1

- Added `/api/game/evaluate/` that allows running arbitrary javascript in the foundry console.
  - This allows for writing custom functions, allowing you to support pretty much anything.
- Removed need for `EXTERNAL_URL` enviroment variable.
- Changed `AUTH_PROVIDER` to `AUTH_PROVIDERS` which is a csv list of which auth providers are enabled.
  - An empty string disables authentication and runs the server wide-open.
  - By default, discord and oidc are enabled, so failing to provide one of them will make authentication fail unless you disable it.
- Removed need for `FOUNDRY_USER`.  Now just requires a player named `APIUser` to work.
  - Can still specify FOUNDRY_USER if you want to use a different player. This is now a username instead of an ID.



# v0.1.0 - Initial Release
