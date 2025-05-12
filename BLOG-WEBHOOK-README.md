# Genesis Blog Webhook Setup

This system automatically creates HTML files for your blog posts whenever you publish a post in Sanity CMS.

## How it Works

1. You publish a post in Sanity CMS
2. Sanity sends a webhook notification to your webhook server
3. The server generates the HTML file for the post
4. Your website can now display the post

## Setup Instructions

### Step 1: Start the Webhook Server

Run the webhook server on your computer or server:

```bash
# Make the script executable (if you haven't already)
chmod +x start-webhook-server.sh

# Start the server
./start-webhook-server.sh
```

The server will run on port 3000 by default. Make sure this port is open and accessible.

### Step 2: Set Up the Webhook in Sanity

1. Log in to your Sanity dashboard
2. Go to API > Webhooks
3. Click "Create webhook"
4. Fill in the following details:
   - Name: "Blog Post HTML Generator"
   - URL: `https://your-server-address.com/webhook` (replace with your actual server address)
   - Dataset: "production"
   - Filter: `_type == "post" && published`
   - Projection: `{documentId: _id, type: "post.published"}`
   - HTTP method: POST
   - HTTP Headers: Add a header `x-webhook-secret` with value `genesis-sanity-webhook`
   - Check "Enable webhook"

5. Click "Save"

### Step 3: Test the Webhook

1. Publish a new post in Sanity (or republish an existing one)
2. Check the webhook server logs to see if it received the webhook
3. Look in the `posts` directory for the newly generated HTML file

## Manual Generation

If you need to manually generate HTML files for all posts:

```bash
# Run the standalone script
node sanity-post-generator.js
```

## Security

For production use:

1. Change the webhook secret in `sanity-webhook-server.js` to a strong random string
2. Use the same secret in the Sanity webhook configuration
3. Use HTTPS instead of HTTP for webhook communication

## Troubleshooting

- Make sure your server is accessible from the internet
- Check the logs for any errors
- Verify the webhook settings in Sanity match your server configuration
- Confirm the post has proper data (title, slug, etc.) in Sanity 