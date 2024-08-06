const approuter = require("@sap/approuter");
const jwtDecode = require("jwt-decode");
 
let ar = approuter();
 
ar.beforeRequestHandler.use("/getUserInfo", (req, res) => {
 
    if (!req.user) {
        res.statusCode = 403;
        res.end("Missing JWT Token");
    }
 
    res.statusCode = 200;
    var decodedJWTToken = jwtDecode(req.user.token.accessToken);
 
    var token = {
        "scope": decodedJWTToken.scope,
        "email": decodedJWTToken.email,
        "xs.user.attributes": decodedJWTToken["xs.user.attributes"]
    };
    res.end(JSON.stringify(
        { decodedJWTToken: token }
    ));
 
});
 
ar.start();