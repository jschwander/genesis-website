# Setting Up Automatic Blog Post Generation with Vercel & GitHub Actions

This guide will help you set up your website to automatically generate blog post HTML files whenever you publish a post in Sanity.

## Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Sanity Blog Webhook"
4. Select these scopes: 
   - `repo` (full control of repositories)
   - `workflow` (to trigger GitHub Actions)
5. Click "Generate token" and **copy the token** (you'll only see it once!)

## Step 2: Configure Vercel Environment Variables

1. Log in to [Vercel](https://vercel.com)
2. Select your Genesis website project
3. Go to "Settings" > "Environment Variables"
4. Add a new environment variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Paste the GitHub token you created in Step 1
5. Make sure to set it for "Production" and "Preview" environments
6. Click "Save"

## Step 3: Deploy Your Website to Vercel

1. Push this code to GitHub
2. Your site should automatically deploy on Vercel
3. If not already deployed, you can manually trigger a deploy from the Vercel dashboard

## Step 4: Set Up Sanity Webhook

1. Log in to your [Sanity management console](https://manage.sanity.io)
2. Navigate to your project
3. Go to API → Webhooks
4. Click "Create webhook"
5. Fill in the following details:
   - **Name**: "Blog Post HTML Generator"
   - **URL**: `https://your-vercel-site.com/api/sanity-webhook` (replace with your actual Vercel domain)
   - **Dataset**: "production"
   - **Filter**: `_type == "post" && published`
   - **Projection**: `{"documentId": _id, "type": "post.published"}`
   - **HTTP method**: POST
   - **HTTP Headers**: Add a header `x-webhook-secret` with value `genesis-sanity-webhook`
   - Check "Enable webhook"
6. Click "Save"

## Step 5: Test the Webhook

1. Edit or create a post in Sanity
2. Publish the post
3. Check your Vercel logs to see if the webhook was triggered
4. Check your GitHub repository - a new GitHub Action should run
5. Once the action completes, your new blog post HTML file should be created

## Understanding How It Works

1. When you publish a post in Sanity, it sends a webhook to your Vercel function
2. The Vercel function triggers a GitHub Action via repository_dispatch event
3. The GitHub Action:
   - Checks out your repository code
   - Runs the post generator script to create the HTML file
   - Commits and pushes the change back to GitHub
4. Vercel automatically deploys the updated site with the new blog post

## Troubleshooting

If posts aren't being generated automatically:

1. Check the Vercel function logs in the Vercel dashboard
2. Make sure your GitHub token has the correct permissions
3. Check the GitHub Actions tab in your repository to see if the action is running
4. Verify the webhook is configured correctly in Sanity
5. Check that the `GITHUB_TOKEN` environment variable is set in Vercel

## Manual Fallback Process

If automated generation isn't working, you can still manually run:

```bash
node sanity-post-generator.js
git add posts/*.html
git commit -m "Add new blog post"
git push
```

## Security Note

For production use:
1. Consider using a GitHub App instead of a personal access token for better security
2. Change the webhook secret in `api/trigger-github-action.js` to a strong random string
3. Update the same secret in the Sanity webhook configuration 