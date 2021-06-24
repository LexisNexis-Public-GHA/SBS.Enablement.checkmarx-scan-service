const dal = require("../dal/checkmarxapi");

class Checkmarx {
    constructor (username, password){
        this.username = username;
        this.password = password;
        this.bearerToken = null;
    }

    login = async() => {
        if (!this.bearerToken){
            this.bearerToken = await dal.LoginAsync(this.username, this.password);
        }
    }

    getProject = async(projectName, teamId) => {
        return await dal.GetProjectByNameAndIdAsync(projectName, teamId, this.bearerToken);
    };

    createProject = async (projectName, teamId) => {
        let createResult = await dal.CreateNewProectAsync(projectName, teamId, this.bearerToken);
        let projectId = createResult.id;

        console.log(createResult);

        console.log(`Using Project ID: ${projectId}`);

        if (projectId) {
            let scanSettingsResult = await dal.UpsertStandardScanSettingsAsync(projectId, this.bearerToken);
            if (scanSettingsResult){

                console.log("Got Scan results!");

                return projectId;
            } else {

                console.log("no scan results!");
                return null;
            }
        }
    };

    upsertGithubScanSettings = async(githubUrl, projectId, branchName) => {
        return await dal.UpsertGitScanSettingsAsync(githubUrl, projectId, branchName, this.bearerToken)
    };

    scheduleScan = async(projectId, isIncremental, forceScan, comment) => {
        return await dal.ScheduleScanAsync(projectId, isIncremental, forceScan, comment, this.bearerToken );
    }

    checkScan = async (scanId) => {
        return await dal.CheckScanAsync(scanId, this.bearerToken);
    };    
}

module.exports = {
    Checkmarx : Checkmarx
}