// Sanity Blog Post HTML Generator
// This script will automatically generate HTML files for all blog posts in your Sanity CMS

const fs = require('fs');
const https = require('https');
const path = require('path');

// Sanity configuration - matches your existing integration
const SANITY_PROJECT_ID = '80jerngq';
const SANITY_DATASET = 'production';

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

// Helper function to escape HTML content
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Fetch all posts from Sanity
function fetchAllPosts() {
  return new Promise((resolve, reject) => {
    // GROQ query to get all posts with essential data
    const query = encodeURIComponent(`
      *[_type == "post"] {
        title,
        slug,
        publishedAt,
        _updatedAt,
        excerpt,
        "categories": categories[]->title,
        "author": author->name,
        "mainImage": mainImage.asset->url,
        body[0] {
          children[0] {
            text
          }
        }
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
function readTemplate() {
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
function generatePostFile(post, template) {
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
    
    // Get description from excerpt or first text block
    const description = escapeHtml(
      post.excerpt || 
      (post.body?.[0]?.children?.[0]?.text) || 
      'Read this article on Genesis Building Company'
    ).trim();

    // Get image URL and ensure it's absolute
    const imageUrl = post.mainImage 
      ? (post.mainImage.startsWith('http') ? post.mainImage : `https://cdn.sanity.io${post.mainImage}`)
      : 'https://www.genesisbuildingco.com/images/default-blog-image.jpg';

    // Replace meta tags with properly escaped values
    const metaReplacements = {
      title: escapeHtml(post.title),
      description: description,
      url: `https://www.genesisbuildingco.com/blog/${post.slug.current}`,
      image: imageUrl,
      publishDate: post.publishedAt || post._updatedAt,
      author: escapeHtml(post.author || 'Genesis Building Company')
    };

    // Replace title tag
    fileContent = fileContent.replace(
      /<title>.*?<\/title>/,
      `<title>${metaReplacements.title} - Genesis Building Company</title>`
    );

    // Replace all Open Graph meta tags
    fileContent = fileContent.replace(
      /<meta property="og:title" content=".*?"/,
      `<meta property="og:title" content="${metaReplacements.title}"`
    );
    
    fileContent = fileContent.replace(
      /<meta property="og:description" content=".*?"/,
      `<meta property="og:description" content="${metaReplacements.description}"`
    );
    
    fileContent = fileContent.replace(
      /<meta property="og:url" content=".*?"/,
      `<meta property="og:url" content="${metaReplacements.url}"`
    );
    
    fileContent = fileContent.replace(
      /<meta property="og:image" content=".*?"/,
      `<meta property="og:image" content="${metaReplacements.image}"`
    );
    
    fileContent = fileContent.replace(
      /<meta property="article:published_time" content=".*?"/,
      `<meta property="article:published_time" content="${metaReplacements.publishDate}"`
    );
    
    fileContent = fileContent.replace(
      /<meta property="article:author" content=".*?"/,
      `<meta property="article:author" content="${metaReplacements.author}"`
    );

    // Replace blog post title
    fileContent = fileContent.replace(
      /<h1 class="blog-post-title">.*?<\/h1>/,
      `<h1 class="blog-post-title">${metaReplacements.title}</h1>`
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
        `<span>${escapeHtml(post.categories[0])}</span>`
      );
    }

    // Write the file
    fs.writeFile(filePath, fileContent, 'utf8', (err) => {
      if (err) {
        reject(new Error(`Error writing file ${fileName}: ${err.message}`));
        return;
      }
      
      console.log(`File ${fileStatus}: ${fileName}`);
      resolve();
    });
  });
}

// Main function
async function generateAllPostFiles() {
  try {
    console.log("Starting blog post generation process...");
    
    // Fetch all posts from Sanity
    const posts = await fetchAllPosts();
    console.log(`Found ${posts.length} posts in Sanity`);
    
    // Read template file
    const template = await readTemplate();
    console.log("Template loaded successfully");
    
    // Generate files for each post
    console.log("Generating HTML files for posts...");
    const generatePromises = posts.map(post => generatePostFile(post, template));
    await Promise.all(generatePromises);
    
    console.log("Post generation complete!");
  } catch (error) {
    console.error("Error generating posts:", error);
  }
}

// Run the generator
generateAllPostFiles(); 