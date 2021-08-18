/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://dashboard.recidiviz.org";
  // https://auth0.com/docs/actions/triggers/post-login
  api.idToken.setCustomClaim(`${namespace}/user_metadata`, event.user.user_metadata)
  api.idToken.setCustomClaim(`${namespace}/app_metadata`, event.user.app_metadata)
  api.accessToken.setCustomClaim(`${namespace}/app_metadata`, event.user.app_metadata)
  api.accessToken.setCustomClaim(`${namespace}/registration_date`, event.user.created_at)
};
