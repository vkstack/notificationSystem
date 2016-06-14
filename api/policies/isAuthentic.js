module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
	if (req.signedCookies.user)
		return next();
	console.log(req.xhr);
	if(req.xhr)
	  return res.forbidden('You are not permitted to perform this action.');
	res.render("login");
  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
};
