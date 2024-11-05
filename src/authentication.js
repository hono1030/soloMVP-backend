require("dotenv").config();

function authentication(req, res, next) {
  if (req.session.userid && req.session.username) {
    next();
  } else {
    res.status(401).send("User Not Logged In");
  }
}

module.exports = authentication;
