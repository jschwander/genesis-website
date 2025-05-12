# Setting Up Automatic Blog Post Generation with Vercel & Sanity

This guide will help you set up your website to automatically generate blog post HTML files whenever you publish a post in Sanity.

## Step 1: Deploy Your Website to Vercel

1. Push this code to GitHub (or GitLab/BitBucket)
2. Log in to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Keep the default settings and click "Deploy"

## Step 2: Set Up Sanity Webhook

1. Log in to your [Sanity management console](https://manage.sanity.io)
2. Navigate to your project
3. Go to API → Webhooks
4. Click "Create webhook"
5. Fill in the following details:
   - **Name**: "Blog Post HTML Generator"
   - **URL**: `https://your-vercel-site.com/api/sanity-webhook` (replace with your actual Vercel domain)
   - **Dataset**: "production"
   - **Filter**: `_type == "post" && published`
   - **Projection**: `{documentId: _id, type: "post.published"}`
   - **HTTP method**: POST
   - **HTTP Headers**: Add a header `x-webhook-secret` with value `genesis-sanity-webhook`
   - Check "Enable webhook"
6. Click "Save"

## Step 3: Test the Webhook

1. Edit or create a post in Sanity
2. Publish the post
3. Check your Vercel logs to see if the webhook was triggered
4. Your post HTML file should be automatically generated

## Understanding How It Works

1. When you publish a post in Sanity, it sends a webhook (notification) to your Vercel function
2. The Vercel function receives the notification and extracts the post ID
3. It then fetches the post data from Sanity
4. It generates an HTML file based on your template
5. It saves the file in the posts directory
6. Your website can now display the post

## Troubleshooting

If posts aren't being generated automatically:

1. Check the Vercel function logs in the Vercel dashboard
2. Verify the webhook is configured correctly in Sanity
3. Make sure the secret matches (`genesis-sanity-webhook`)
4. Try manually running the generator as a fallback:
   ```
   node sanity-post-generator.js
   ```

## Security Note

For production use:
1. Change the webhook secret in `api/sanity-webhook.js` to a strong random string
2. Update the same secret in the Sanity webhook configuration 