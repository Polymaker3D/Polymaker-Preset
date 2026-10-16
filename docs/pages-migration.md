# Pages migration and production validation

The existing site publishes from `main` at `/` with the custom domain
`presets.polymaker.com`. This migration keeps the domain and public routes.
Its purpose is to build generated files in CI without committing to PRs.

## Before opening the PR

1. Run `npm ci --ignore-scripts` and `npm run build:site`.
2. Run `npm run verify:site` and check that tracked source files did not change.
3. Package `_site` using the Pages artifact tar format. Extract it into an
   isolated source checkout and run the entire test suite on Node.js 20.20,
   22.22 (with coverage), and 24. This exercises the actual CI handoff.
4. Serve `_site` locally and run
   `npm run smoke:site -- http://localhost:8000 --all-presets`.
   Check filters, JSON/INI/bundle downloads, both themes, and mobile display.
5. Validate workflows with `actionlint`. Confirm there are no source-write
   permissions or bot commits and PRs cannot reach the deployment job.
6. Push the branch and manually dispatch **Run Tests** on that branch.
   The build, artifact transfer, and three hosted test jobs must pass;
   production publishing checks and deployment must be skipped.

## Before merging

1. Open the PR only after branch validation passes.
2. Check the PR's own **Run Tests** run, including artifact transfer and all
   three test jobs. Confirm `deploy` is skipped and the PR head has not changed.
3. Download its `github-pages` artifact. Inspect `build-info.json`, verify the
   archive, and serve the extracted files for an HTTP smoke check.
4. Review the production Pages source and `github-pages` environment policy.
   The migration needs no new repository secret or bot identity.
5. Obtain production merge approval. Keep the Pages setting in branch mode
   until the first merged main run has built and tested its artifact.

## Production activation

1. Merge the reviewed PR. The first main run builds and tests the artifact,
   reports that branch publishing is still active, and skips Actions deployment.
   The existing branch-based publishing remains responsible for production.
2. Download and check the main artifact. Its `build-info.json` must contain the
   merged main SHA and the correct preset count.
3. In **Settings > Pages > Build and deployment > Source**, an administrator
   selects **GitHub Actions**. Preserve the existing custom domain and HTTPS
   setting. Keep the `github-pages` environment restricted to `main`.
4. Manually dispatch **Run Tests** on `main`. The same build and three test jobs
   run before `actions/deploy-pages` publishes the tested artifact.
5. Confirm the deployment and post-deployment HTTP smoke check are successful.
   Check `https://presets.polymaker.com/build-info.json` against the run's SHA,
   then check filters and JSON/INI/bundle downloads in production.
6. Record the successful run and SHA. A failed smoke check is a failed
   deployment validation and requires investigation before further releases.

The actual Pages deployment and custom-domain/CDN behavior can only be proved
against a Pages environment. Local checks and branch CI validate everything
through the artifact handoff; they do not constitute a production deployment.
Activation therefore remains a separate, explicit step after merge approval.

## Rollback

Before activation, keep branch publishing selected; Actions deployment is
disabled by the workflow's read-only publishing-mode check.

After activation, revert the offending change through a reviewed PR. The new
main commit regenerates the previous site content, runs all tests, and deploys
it through the same pipeline. Do not rerun an older main workflow as a rollback:
the current-main guard intentionally skips superseded commits. Do not switch
back to branch publishing after subsequent preset updates without first
regenerating its snapshots; tracked `index.json` and SEO content can be stale.

Artifacts are retained for seven days for inspection. Download the previous
known-good artifact before approving a production release when a longer-lived
rollback copy is needed.
