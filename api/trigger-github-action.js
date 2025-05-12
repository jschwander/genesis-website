// Simpler webhook handler that triggers a GitHub Action
const https = require('https');

// Configuration
const WEBHOOK_SECRET = 'genesis-sanity-webhook';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'jschwander';
const GITHUB_REPO = 'genesis-website'; 

// The main handler function
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  
  // Check webhook secret
  const providedSecret = req.headers['x-webhook-secret'];
  if (providedSecret !== WEBHOOK_SECRET) {
    console.warn('Invalid webhook secret provided');
    res.status(403).json({ success: false, message: 'Forbidden: Invalid secret' });
    return;
  }
  
  try {
    // Parse webhook payload from Sanity
    const payload = req.body;
    
    // Trigger GitHub Action using repository_dispatch event
    const success = await triggerGitHubAction(payload);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'GitHub Action triggered successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to trigger GitHub Action'
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error.message}`
    });
  }
}

// Trigger a GitHub repository_dispatch event
async function triggerGitHubAction(sanityPayload) {
  return new Promise((resolve, reject) => {
    // Prepare the data to send to GitHub API
    const data = JSON.stringify({
      event_type: 'sanity-post-published',
      client_payload: {
        documentId: sanityPayload.documentId || '',
        type: sanityPayload.type || 'post.published'
      }
    });
    
    // Configure the HTTP request
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
      method: 'POST',
      headers: {
        'User-Agent': 'Sanity-Webhook-Bot',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    // Send the request
    const req = https.request(options, (res) => {
      // GitHub returns 204 No Content for successful repository_dispatch
      if (res.statusCode === 204) {
        console.log('GitHub Action triggered successfully');
        resolve(true);
      } else {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.error(`GitHub API returned status ${res.statusCode}:`, responseData);
          resolve(false);
        });
      }
    });
    
    req.on('error', (error) => {
      console.error('Error triggering GitHub Action:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
} 