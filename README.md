# Checkmarx Scan Service for SBS 

## WE HAVE MOVED!!!  This repo is no longer used and will be removed at some point in the future. 

https://github.com/marketplace/actions/lnrs-checkmarx-scan-service


## Usage in action

    runs-on: [docker, no-db]
    steps:
        - name: Run Checkmarx Scan for SBS services
          uses: LexisNexis-Public-GHA/SBS.Enablement.checkmarx-scan-service@1.0.0
        with:
          cx_username: ${{ secrets.CHECKMARX_USERNAME }}
          cx_password: ${{ secrets.CHECKMARX_PASSWORD }}
          cx_risk_threshold: 101
          cx_project_name: Accuity - SBS - ProjectName (%branch_name%)
          gh_repo_name: ${{ github.repository }}
          gh_branch_name: ${{ github.ref }}
          gh_pem_file: ${{ secrets.GH_APP_SECRET }}
          gh_commit_sha: ${{ github.sha }}

**Note:** *%branch_name%* is a variable that represents the projects current branch name.

## Setting up in SBS Repo

TODO: add setup instructions
