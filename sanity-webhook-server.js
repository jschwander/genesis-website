// Sanity Webhook Server
// This script creates a simple HTTP server that listens for webhook calls from Sanity
// and generates HTML files for blog posts automatically

const http = require('http');
const fs = require('fs');
const https = require('https');
const path = require('path');

// Sanity configuration
const SANITY_PROJECT_ID = '80jerngq';
const SANITY_DATASET = 'production';

// Server configuration
const PORT = 3000;
const WEBHOOK_SECRET = 'genesis-sanity-webhook'; // Replace with a secure random string in production

// File paths
const TEMPLATE_FILE = path.join(__dirname, 'posts', 'blog-post-template.html');
const POSTS_DIRECTORY = path.join(__dirname, 'posts');

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
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

// Fetch a specific post from Sanity by ID
async function fetchPostById(postId) {
  return new Promise((resolve, reject) => {
    // GROQ query to get post by _id
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

// Fetch all posts from Sanity
async function fetchAllPosts() {
  return new Promise((resolve, reject) => {
    // GROQ query to get all posts
    const query = encodeURIComponent(`
      *[_type == "post"] {
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
          resolve(parsedData.result);
        } catch (e) {
          reject(new Error(`Error parsing Sanity response: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Error fetching from Sanity: ${e.message}`));
    });
  });
}

// Read the template file
async function readTemplate() {
  return new Promise((resolve, reject) => {
    fs.readFile(TEMPLATE_FILE, 'utf8', (err, data) => {
      if (err) {
        reject(new Error(`Error reading template: ${err.message}`));
        return;
      }
      resolve(data);
    });
  });
}

// Generate an HTML file for a post
async function generatePostFile(post, template) {
  return new Promise((resolve, reject) => {
    // Create filename from slug if available, otherwise from title
    const fileName = post.slug && post.slug.current 
      ? `${post.slug.current}.html`
      : `${slugify(post.title)}.html`;
    
    const filePath = path.join(POSTS_DIRECTORY, fileName);
    
    // Replace placeholder content with actual post data
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
    
    // Write the file
    fs.writeFile(filePath, fileContent, 'utf8', (err) => {
      if (err) {
        reject(new Error(`Error writing file ${fileName}: ${err.message}`));
        return;
      }
      
      console.log(`Generated file: ${fileName}`);
      resolve(fileName);
    });
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
    
    // Read template file
    const template = await readTemplate();
    
    // Generate HTML file
    const fileName = await generatePostFile(post, template);
    return fileName;
  } catch (error) {
    console.error('Error processing post:', error);
    return null;
  }
}

// Generate files for all posts
async function generateAllPostFiles() {
  try {
    console.log("Starting blog post generation process for all posts...");
    
    // Fetch all posts from Sanity
    const posts = await fetchAllPosts();
    console.log(`Found ${posts.length} posts in Sanity`);
    
    // Read template file
    const template = await readTemplate();
    console.log("Template loaded successfully");
    
    // Generate files for each post
    console.log("Generating HTML files for posts...");
    const fileNames = [];
    for (const post of posts) {
      try {
        const fileName = await generatePostFile(post, template);
        fileNames.push(fileName);
      } catch (err) {
        console.error(`Error generating file for post '${post.title}':`, err);
      }
    }
    
    console.log("Post generation complete!");
    return fileNames;
  } catch (error) {
    console.error("Error generating posts:", error);
    return [];
  }
}

// Create HTTP server to receive webhook calls
const server = http.createServer(async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }
  
  // Check webhook path
  if (req.url !== '/webhook') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  
  // Get request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      // Parse webhook payload
      const payload = JSON.parse(body);
      
      // Check secret (optional, but recommended for security)
      const providedSecret = req.headers['x-webhook-secret'];
      if (providedSecret !== WEBHOOK_SECRET) {
        console.warn('Invalid webhook secret provided');
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
      }
      
      // Process webhook based on type
      if (payload.type === 'post.published') {
        // A post was published - process just this post
        const postId = payload.documentId;
        const fileName = await processSinglePost(postId);
        
        if (fileName) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: `Generated file: ${fileName}`
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Failed to generate file'
          }));
        }
      } else if (payload.type === 'regenerate.all') {
        // Regenerate all files
        const fileNames = await generateAllPostFiles();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Generated ${fileNames.length} files`,
          files: fileNames
        }));
      } else {
        // Unknown event type
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: `Unknown webhook type: ${payload.type}`
        }));
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: `Error: ${error.message}`
      }));
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`HTML files will be generated in: ${POSTS_DIRECTORY}`);
});

// Also export the functions for direct usage
module.exports = {
  generateAllPostFiles,
  processSinglePost
}; 