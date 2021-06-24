const core          = require("@actions/core");
const { Checkmarx } = require("./business/checkmarx.js");
const { CheckmarxGitHubApp } = require ("./business/github.js");

// checkmarx params
const username      = core.getInput("cx_username");
const password      = core.getInput("cx_password");

const isIncremental = core.getInput("cx_is_incremental").toLowerCase()  === "true";
const forceScan     = core.getInput("cx_force_scan").toLowerCase()      === "true";
const waitForScan   = core.getInput("cx_wait_for_scan").toLowerCase()   === "true";
const teamId        = core.getInput("cx_team_id");
// mutable
let projectName     = core.getInput("cx_project_name");

const riskThreshold = parseInt(core.getInput("cx_risk_threshold"))  || 101;     // fails github action if can result scanRiskSeverity is greater than or equal to riskThreshold
                                                                                // 101 effectively nullifies it as 100 is the highest scanRiskSeverity is 100

// github params
const pemfile       = core.getInput("gh_pem_file");
const repoName      = core.getInput("gh_repo_name");
const branchName    = core.getInput("gh_branch_name");
const comment       = core.getInput("gh_commit_sha")

// derived variables
let simpleBranchName    = branchName.split('/').pop(); 
projectName = projectName.replace("%branch_name%", simpleBranchName);

core.info(`==> Using ProjectName: ${projectName}`);

function getExecutionTime(startDate){
    return Math.floor((new Date() - startDate) / 1000); 
}

async function main(){

    core.info("Starting Checkmarx Scan for SBS Services Action");

    core.info("==> Validating Variables");
    // check variables
    let requiredVariables = [
        {name: "cx_username"    , value: username},
        {name: "cx_password"    , value: password},
        {name: "gh_pem_file"    , value: pemfile},
        {name: "gh_repo_name"   , value: repoName},
        {name: "gh_branch_name" , value: branchName},
        {name: "gh_commit_sha"  , value: comment},
    ];

    let hasValidationError = false;
    for(i = 0; i < requiredVariables.length; i++){
        let o = requiredVariables[i];
        if (!o.value){
            hasValidationError = true;
            core.error(`====> Validation Error: ${o.name} value is required`);
        }
    }

    if (hasValidationError){
        throw "Unable to continue, fix validation errors";
    }

    let cm = new Checkmarx(username, password);
    core.info("==> Logging into Checkmarx API");
    await cm.login()
        .catch((err) => {
            console.error("====> Unable to login to checkmarx API, check username and password");
            throw err;
        });
    
    core.info ("==> Checking if Project Exists");
    core.debug(`====> Checking: ProjectName: ${projectName}`);
    core.debug(`                TeamId     : ${teamId}`);
    let projects = await cm.getProject(projectName, teamId);
    let projectId = -1;
    if (projects 
            && projects.length > 0 
            && projects[0].name 
            && projects[0].name.toLowerCase() === projectName.toLowerCase()){
                core.info("==> Project already exists!");
        projectId = projects[0].id;
    } else {
        core.info("Project does not exist... need to create");
        projectId = await cm.createProject(projectName, teamId);
    }

    // gather info for updating project for new scan
    if (!projectId || projectId < 0){
        throw "project id is not valid, something went wrong with creating or getting the information"
    }

    core.debug(`====> Using Project ID: ${projectId}`);

    core.info(`==> Generating GITHUB Access Token (valid for 1 hour)`);
    let cmApp = new CheckmarxGitHubApp(pemfile);
    let tokenResponse = await cmApp.generateAccessTokenAsync();

    core.info(`====> Github token Generated Successfully`);

    core.info("==> Updating Scan settings for project with new token");

    let token = tokenResponse.token;
    let githubUrl = `https://no-user:${token}@github.com/${repoName}`

    await cm.upsertGithubScanSettings(githubUrl, projectId, branchName)
        .catch((err) => {
            core.error("Something went wrong with updating scan settings in checkmarx");
            throw err;
        })

    core.info("====> Scan settings successfully updated");
    core.info("==> Scheduling Scan");

    // schedule scan.
    let scanResult = await cm.scheduleScan(projectId, isIncremental, forceScan)
                            .catch ((err) => {
                                core.error("Something went wrong with scheduling the scan");
                                throw err;
                            });

    let scanId = scanResult.id;
    core.info(`====> Scan ${scanId} successfully scheduled`);

    if (waitForScan){
        core.info("==> Waiting for scan to finish");
    }

    let startDate = new Date();

    let okToScan = true;
    while(waitForScan && okToScan){
        // wait 30 seconds
        await new Promise(r => setTimeout(r, 30000));

        let status = await cm.checkScan(scanId)
                                .catch((err) => {
                                    core.error("something went wrong with checking the status of the scan");
                                    throw err;
                                });

        if (status.status.id === 7){ // finished
            okToScan = false;

            let extTime = getExecutionTime(startDate);

            core.info(`====> Scan Completed in ${extTime} seconds`);
            core.info(`====> Scan Risk Severity: ${status.scanRiskSeverity}`);

            if (riskThreshold <= parseInt(status.scanRiskSeverity)){
                core.info(`==> Failing check, risk threshold breached`);
                throw "Scan Severity is greater than set risk threshold";
            }
        } else {
            core.info(`====> Scan Checked after ${getExecutionTime(startDate)} seconds.  Current Status: ${status.status.name} `);
        }
    }
}

main().then(() => {
    core.info("Scan Completed Successfully")
})
.catch((err) => {
    core.setFailed(err);
});