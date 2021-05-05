const fs    = require("fs");
const jwt   = require("jsonwebtoken");
const axios = require("axios");

class CheckmarxGitHubApp {
    constructor(privateKey){
        this.id = "113731";
        this.installationId = "16713846";
        this.privateKey = privateKey;
    }

    generateAccessTokenAsync = async () => {
        
        //let key = fs.readFileSync(this.privateKeyPath, "utf8");

        let payload = {
            iat: Math.floor(new Date().getTime() / 1000) - 60,
            exp: Math.floor(new Date().getTime() / 1000) + (10 * 60),
            iss: this.id
        };
        
        let signingOptions = {
            algorithm:  "RS256"
        };

        let token = jwt.sign(payload, this.privateKey, signingOptions);

        // now that we have the bearer token, we need to exchange that for an access token

        let url = `https://api.github.com/app/installations/${this.installationId}/access_tokens`;

        let config = {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };

        return axios.post(url, null, config)
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                console.log(err);
                return null;
            });
    };

}

module.exports = {
    CheckmarxGitHubApp : CheckmarxGitHubApp
}

