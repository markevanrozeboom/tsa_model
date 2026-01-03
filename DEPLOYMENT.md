# GitHub Pages Deployment Guide

This document explains how the TSA Financial Scenario Model is deployed to GitHub Pages.

## Overview

The TSA Financial Scenario Model is a fully self-contained single-page application (SPA) that runs entirely in the browser. It requires no backend server or build process, making it perfect for GitHub Pages hosting.

## Live URL

Once deployed, the application is available at:
**https://markevanrozeboom.github.io/tsa_model/**

## Deployment Setup

### Automatic Deployment

The repository is configured with a GitHub Actions workflow that automatically deploys to GitHub Pages whenever code is pushed to the `main` or `master` branch.

**Workflow file**: `.github/workflows/deploy-pages.yml`

### Manual Deployment

You can also trigger a deployment manually:

1. Go to the repository on GitHub
2. Click on the "Actions" tab
3. Select "Deploy to GitHub Pages" workflow
4. Click "Run workflow"
5. Select the branch and click "Run workflow"

## How It Works

1. **Trigger**: The workflow runs on push to `main`/`master` or manual trigger
2. **Checkout**: The workflow checks out the repository code
3. **Setup Pages**: Configures GitHub Pages settings
4. **Upload**: Uploads all repository files as a static site artifact
5. **Deploy**: Deploys the artifact to GitHub Pages

## Repository Settings

To enable GitHub Pages for the first time (this is typically done once):

1. Go to repository **Settings**
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select "GitHub Actions" as the deployment source
4. The workflow will handle the rest automatically

## What Gets Deployed

The entire repository root is deployed, including:
- `index.html` - The main application file
- `README.md` - Documentation (accessible via GitHub)
- `tsa-scenario-model.jsx` - Source React component (for reference)
- `TSA Model (3).xlsx` - Original Excel model (for reference)
- All other markdown documentation files

Since `index.html` is in the root, navigating to the GitHub Pages URL automatically loads the application.

## Files NOT Deployed

Files listed in `.gitignore` are not included in the deployment:
- `node_modules/`
- Build artifacts
- Temporary files
- Environment files

## Updating the Deployed Site

To update the live site:

1. Make changes to `index.html` or other files
2. Commit and push to the `main` or `master` branch:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```
3. The workflow will automatically deploy the changes
4. Wait 1-2 minutes for the deployment to complete
5. Visit the live URL to see your changes

## Troubleshooting

### Deployment Failed

1. Check the **Actions** tab on GitHub for error logs
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow file has correct permissions

### Changes Not Showing

1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Wait a few minutes - GitHub Pages can take time to propagate
3. Check if the workflow completed successfully in the Actions tab

### 404 Error

1. Ensure `index.html` exists in the repository root
2. Check that GitHub Pages is set to deploy from GitHub Actions (not a branch)
3. Verify the repository is public (or you have GitHub Pro/Team for private Pages)

## Local Testing

Before deploying, you can test locally:

1. Simply open `index.html` in a web browser
2. The application works fully offline after initial load
3. All CDN resources are loaded from public CDNs

## Performance Considerations

- The application loads all dependencies from CDNs (React, Recharts, Tailwind, Lucide)
- First load requires internet to fetch CDN resources
- Subsequent loads may use browser cache
- The application is fully client-side with no server requests after initial load

## Security Notes

- No backend server means no server-side vulnerabilities
- All calculations happen in the browser
- No user data is stored or transmitted
- CDN resources use SRI (Subresource Integrity) would be recommended for production

## Costs

GitHub Pages hosting is **free** for public repositories! There are no hosting costs for this application.

## Support

For issues with deployment:
1. Check GitHub Actions logs
2. Review GitHub Pages documentation: https://docs.github.com/en/pages
3. Ensure repository permissions are correct

For issues with the application itself:
1. See `README.md` for application documentation
2. Check `index.html` for source code
3. Review browser console for JavaScript errors
