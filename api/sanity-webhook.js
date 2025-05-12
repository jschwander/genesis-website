// Serverless function to handle Sanity webhooks in Vercel
const https = require('https');

// Sanity configuration
const SANITY_PROJECT_ID = '80jerngq';
const SANITY_DATASET = 'production';
const WEBHOOK_SECRET = 'genesis-sanity-webhook';

// GitHub configuration
const GITHUB_OWNER = 'jschwander';
const GITHUB_REPO = 'genesis-website';
const GITHUB_BRANCH = 'main';
// NOTE: You'll need to set GITHUB_TOKEN as an environment variable in Vercel

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Clean a string to make it URL-friendly
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Fetch a specific post from Sanity by ID
async function fetchPostById(postId) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(`
      *[_type == "post" && _id == "${postId}"][0] {
        title,
        slug,
        publishedAt,
        "categories": categories[]->title,
        "author": author->name
      }
    `);
    
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.result) {
            resolve(parsedData.result);
          } else {
            reject(new Error('Post not found in Sanity'));
          }
        } catch (e) {
          reject(new Error(`Error parsing Sanity response: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Error fetching from Sanity: ${e.message}`));
    });
  });
}

// Fetch template file from GitHub repository
async function fetchTemplateFromGitHub() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/posts/blog-post-template.html?ref=${GITHUB_BRANCH}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Sanity-Webhook-Bot',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(new Error(`GitHub API error: ${response.message}`));
            return;
          }
          
          // Template content is base64 encoded
          const content = Buffer.from(response.content, 'base64').toString('utf8');
          resolve(content);
        } catch (e) {
          reject(new Error(`Error parsing GitHub response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(new Error(`Error fetching template from GitHub: ${e.message}`));
    });
    
    req.end();
  });
}

// Generate HTML content for a post
function generatePostHTML(post, template) {
  let fileContent = template;
  
  // Replace title
  fileContent = fileContent.replace(
    /<title>.*?<\/title>/,
    `<title>${post.title} - Genesis Building Company</title>`
  );
  
  // Replace blog post title
  fileContent = fileContent.replace(
    /<h1 class="blog-post-title">.*?<\/h1>/,
    `<h1 class="blog-post-title">${post.title}</h1>`
  );
  
  // Replace date if available
  if (post.publishedAt) {
    const formattedDate = formatDate(post.publishedAt);
    fileContent = fileContent.replace(
      /<span>May 9, 2025<\/span>/,
      `<span>${formattedDate}</span>`
    );
  }
  
  // Replace author if available
  if (post.author) {
    fileContent = fileContent.replace(
      /<span>John Smith<\/span>/,
      `<span>${post.author}</span>`
    );
  }
  
  // Replace category if available
  if (post.categories && post.categories.length > 0) {
    fileContent = fileContent.replace(
      /<span>Construction Costs<\/span>/,
      `<span>${post.categories[0]}</span>`
    );
  }
  
  return fileContent;
}

// Commit file to GitHub repository
async function commitFileToGitHub(filePath, content, commitMessage) {
  return new Promise((resolve, reject) => {
    // First check if file exists to get SHA if it does
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Sanity-Webhook-Bot',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    };

    const checkReq = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let sha = null;
        
        // If file exists, get its SHA
        if (res.statusCode === 200) {
          try {
            const fileInfo = JSON.parse(data);
            sha = fileInfo.sha;
          } catch (e) {
            console.error('Error parsing existing file info:', e);
          }
        }
        
        // Now create or update the file
        const postData = JSON.stringify({
          message: commitMessage,
          content: Buffer.from(content).toString('base64'),
          branch: GITHUB_BRANCH,
          ...(sha && { sha }) // Include SHA if file exists
        });
        
        const commitOptions = {
          hostname: 'api.github.com',
          path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
          method: 'PUT',
          headers: {
            'User-Agent': 'Sanity-Webhook-Bot',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${process.env.GITHUB_TOKEN}`
          }
        };
        
        const commitReq = https.request(commitOptions, (commitRes) => {
          let commitData = '';
          
          commitRes.on('data', (chunk) => {
            commitData += chunk;
          });
          
          commitRes.on('end', () => {
            if (commitRes.statusCode === 200 || commitRes.statusCode === 201) {
              resolve({
                success: true,
                path: filePath
              });
            } else {
              try {
                const response = JSON.parse(commitData);
                reject(new Error(`GitHub API error: ${response.message}`));
              } catch (e) {
                reject(new Error(`Error committing file: ${commitRes.statusCode}`));
              }
            }
          });
        });
        
        commitReq.on('error', (e) => {
          reject(new Error(`Error committing file to GitHub: ${e.message}`));
        });
        
        commitReq.write(postData);
        commitReq.end();
      });
    });
    
    checkReq.on('error', (e) => {
      reject(new Error(`Error checking file existence: ${e.message}`));
    });
    
    checkReq.end();
  });
}

// Process a single post by ID
async function processSinglePost(postId) {
  try {
    console.log(`Processing post with ID: ${postId}`);
    
    // Fetch the post from Sanity
    const post = await fetchPostById(postId);
    if (!post) {
      console.log('Post not found in Sanity');
      return null;
    }
    
    // Read template file from GitHub
    const template = await fetchTemplateFromGitHub();
    
    // Generate HTML content
    const htmlContent = generatePostHTML(post, template);
    
    // Create filename from slug if available, otherwise from title
    const fileName = post.slug && post.slug.current 
      ? `${post.slug.current}.html`
      : `${slugify(post.title)}.html`;
    
    const filePath = `posts/${fileName}`;
    
    // Commit file to GitHub
    await commitFileToGitHub(
      filePath,
      htmlContent,
      `Add/update blog post: ${post.title}`
    );
    
    return fileName;
  } catch (error) {
    console.error('Error processing post:', error);
    return null;
  }
}

// The main handler function for Vercel serverless function
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
  
  // Check if GitHub token is configured
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is not set');
    res.status(500).json({ 
      success: false, 
      message: 'Server configuration error: GitHub token not set' 
    });
    return;
  }
  
  try {
    // Parse webhook payload
    const payload = req.body;
    
    // Process webhook based on type
    if (payload.type === 'post.published' && payload.documentId) {
      // A post was published - process just this post
      const fileName = await processSinglePost(payload.documentId);
      
      if (fileName) {
        res.status(200).json({
          success: true,
          message: `Generated and committed file: ${fileName}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to generate file'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: `Unsupported webhook type or missing documentId`
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