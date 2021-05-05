# Checkmarx Scan Service for SBS 
## Usage in action

    runs-on: [docker, no-db]
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Run the Scan
        uses: ./actions/run-checkmarx-scan
        id: run_checkmarx_scan
        with:
          cx_username: ${{ secrets.CHECKMARX_USERNAME }}
          cx_password: ${{ secrets.CHECKMARX_PASSWORD }}
          cx_risk_threshold: 101
          gh_repo_name: ${{ github.repository }}
          gh_branch_name: ${{ github.ref }}
          gh_pem_file: ${{ secrets.GH_APP_SECRET }}

## Setting up in SBS Repo

TODO: add setup instructions