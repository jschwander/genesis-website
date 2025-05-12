// Serverless function to handle Sanity webhooks in Vercel
const fs = require('fs');
const path = require('path');
const https = require('https');

// Sanity configuration
const SANITY_PROJECT_ID = '80jerngq';
const SANITY_DATASET = 'production';
const WEBHOOK_SECRET = 'genesis-sanity-webhook';

// File paths
const TEMPLATE_FILE = path.join(process.cwd(), 'posts', 'blog-post-template.html');
const POSTS_DIRECTORY = path.join(process.cwd(), 'posts');

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

// Fetch all posts from Sanity
async function fetchAllPosts() {
  return new Promise((resolve, reject) => {
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
    
    // Check if file already exists - we'll overwrite it now
    const fileStatus = fs.existsSync(filePath) ? 'updated' : 'created';
    
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
      
      console.log(`File ${fileStatus}: ${fileName}`);
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
          message: `Generated file: ${fileName}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to generate file'
        });
      }
    } else {
      // Default: regenerate all files
      const fileNames = await generateAllPostFiles();
      
      res.status(200).json({
        success: true,
        message: `Generated ${fileNames.length} files`,
        files: fileNames
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