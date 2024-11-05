require("dotenv").config();

function authentication(req, res, next) {
  if (req.session.userid && eq.session.username) {
    // needed to remove .username from this if to unblock the frontend
    console.log(req.session.userid, req.session.username);
    next();
  } else {
    res.status(401).send("User Not Logged In");
  }
}

module.exports = authentication;
