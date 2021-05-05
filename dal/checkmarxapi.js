const axios     = require("axios");
const https     = require("https");
const cxApiUrl  = "https://checkmarx.rbxd.ds/cxrestapi";

const cmInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

async function LoginAsync(username, password){
    let url = `${cxApiUrl}/auth/identity/connect/token`;

    let config = {
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded"
        }
    }

    let params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");
    params.append("scope", "sast_rest_api");
    params.append("client_id", "resource_owner_client");
    params.append("client_secret", "014DF517-39D1-4453-B7B3-9930C563627C");

    return cmInstance.post(url, params, config)
        .then((result) => {
            return result.data.access_token;
        });
}

async function GetProjectByNameAndIdAsync(projectName, teamId, bearerToken){
    let url = `${cxApiUrl}/projects?projectName=${projectName}&teamId=${teamId}`;

    let config = {
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Authorization" : `Bearer ${bearerToken}`
        }
    };
    return cmInstance.get(url, config)
        .then((result) => {
            return result.data;
        })
        .catch((err) => {
            return null;
        });
}

async function CreateNewProectAsync(projectName, teamId, bearerToken){
    let url = `${cxApiUrl}/projects`;
    let body = {
        name: projectName,
        owningTeam : teamId,
        isPublic: true
    };

    let config = {
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${bearerToken}`
        }
    };

    return cmInstance.post(url, body, config)
        .then((result) => {
            return result.data;
        })
        .catch ((err) => {
            return null;
        });
}

async function UpsertStandardScanSettingsAsync(projectId, bearerToken){
    let url = `${cxApiUrl}/sast/scansettings`;
    let body = {
        projectId: projectId,
        presetId: 100001, //standard for sbs
        engineConfigurationId: 1 // standard for sbs
    };

    let config = {
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${bearerToken}`
        }
    };

    return cmInstance.post(url, body, config)
        .then ((result) => {
            return result.data;
        })
        .catch((err) => {
            return null;
        });
}

async function UpsertGitScanSettingsAsync(githubUrl, projectId, branchName, bearerToken){
    let url = `${cxApiUrl}/projects/${projectId}/sourceCode/remoteSettings/git`;

    let body = {
        url: githubUrl,
        branch: branchName
    };

    let config = {
        headers: {
            "Authorization": `Bearer ${bearerToken}`
        }
    };

    return cmInstance.post(url, body, config)
        .then((result) => {
            
            return result.status === 204;

        })
        .catch((err) => {
            console.log(err);
            throw err;
        });

}

async function ScheduleScanAsync (projectId, isIncremental, forceScan, comment, bearerToken){
    let url = `${cxApiUrl}/sast/scans`;

    let body = {
        projectId: projectId,
        isIncremental: isIncremental,
        isPublic: true,
        forceScan: forceScan,
        comment: comment
    };

    let config = {
        headers : {
            Authorization: `Bearer ${bearerToken}`
        }
    };

    return cmInstance.post(url, body, config)
        .then((result) => {
            return result.data;
        });
}

async function CheckScanAsync(scanId, bearerToken){
    let url = `${cxApiUrl}/sast/scans/${scanId}`;

    let config = {
        headers: {
            Authorization: `Bearer ${bearerToken}`
        }
    };

    return cmInstance.get(url, config)
        .then((result) => {
            return result.data;
        });
}


module.exports = {
    LoginAsync                  : LoginAsync,
    GetProjectByNameAndIdAsync  : GetProjectByNameAndIdAsync,
    CreateNewProectAsync        : CreateNewProectAsync,
    UpsertStandardScanSettingsAsync : UpsertStandardScanSettingsAsync,
    UpsertGitScanSettingsAsync: UpsertGitScanSettingsAsync,
    ScheduleScanAsync : ScheduleScanAsync,
    CheckScanAsync: CheckScanAsync
}