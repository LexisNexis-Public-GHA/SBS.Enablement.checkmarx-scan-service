### environment variables for testing

### DO NOT CHECK IN THIS FILE WITH SENSITVE INFO IN IT ###

$env:INPUT_cx_username = "" ## actual username here
$env:INPUT_cx_password = "" ## actual password here

$env:INPUT_cx_is_incremental = "false"
$env:INPUT_cx_force_scan = "false"
$env:INPUT_cx_wait_for_scan = "true"
$env:INPUT_cx_team_id = "27"
$env:INPUT_cx_risk_threshold = "101"
$env:INPUT_cx_project_name = "Accuity - SBS - StandardBuildTools (test-4)"

## actual pem file here here
$env:INPUT_gh_pem_file = @"

"@

$env:INPUT_gh_repo_name = "LexisNexis-RBA/SBS.Enablement.sbs-standardbuildtools"
$env:INPUT_gh_branch_name = "/refs/heads/develop"
$env:INPUT_gh_commit_sha  = "ecfc62f1b404d7c9c2cfb32cec339850626a03e6" ## update it with latest commit sha

npm run run-scan-debug