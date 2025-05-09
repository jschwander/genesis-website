// Script to fetch the latest blog post for footer display
const SANITY_PROJECT_ID = '80jerngq';
const SANITY_DATASET = 'production';

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Helper to determine if we're in a post page
function isPostPage() {
  return window.location.pathname.includes('/posts/');
}

// Get base path for assets and links
function getBasePath() {
  return isPostPage() ? '../' : '';
}

// Fetch the latest blog post
async function fetchLatestBlogPost() {
  try {
    // GROQ query to get only the most recent post
    const query = encodeURIComponent(`
      *[_type == "post"] | order(publishedAt desc)[0] {
        title,
        slug,
        excerpt,
        publishedAt,
        "imageUrl": mainImage.asset->url,
        "categories": categories[]->title
      }
    `);
    
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.result) {
      // Don't show the latest post if we're already on that post
      if (isPostPage() && window.location.pathname.includes(data.result.slug.current)) {
        // Try to get the second latest post instead
        fetchSecondLatestPost();
      } else {
        displayLatestPost(data.result);
      }
    } else {
      console.log('No posts found');
      hideLatestPostSection();
    }
  } catch (error) {
    console.error('Error fetching latest blog post:', error);
    hideLatestPostSection();
  }
}

// Fetch the second latest post (for when we're already on the latest post page)
async function fetchSecondLatestPost() {
  try {
    // GROQ query to get the second most recent post
    const query = encodeURIComponent(`
      *[_type == "post"] | order(publishedAt desc)[1] {
        title,
        slug,
        excerpt,
        publishedAt,
        "imageUrl": mainImage.asset->url,
        "categories": categories[]->title
      }
    `);
    
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.result) {
      displayLatestPost(data.result);
    } else {
      console.log('No second post found');
      hideLatestPostSection();
    }
  } catch (error) {
    console.error('Error fetching second latest blog post:', error);
    hideLatestPostSection();
  }
}

// Display the latest blog post in the footer
function displayLatestPost(post) {
  const container = document.querySelector('.latest-post-content');
  if (!container) return;
  
  // Create excerpt if needed
  const excerpt = post.excerpt || 'Read our latest insights on construction management and innovation.';
  
  // Limit excerpt length
  const shortenedExcerpt = excerpt.length > 120 ? 
    excerpt.substring(0, 120).trim() + '...' : 
    excerpt;
  
  // Get base path for links
  const basePath = getBasePath();
  
  // Create HTML for latest post
  const postHtml = `
    <div class="latest-post-image">
      ${post.imageUrl ? 
        `<img src="${post.imageUrl}?w=120&h=120&fit=crop" alt="${post.title}">` : 
        '<div class="placeholder-image"><i class="fas fa-newspaper"></i></div>'
      }
    </div>
    <div class="latest-post-details">
      <h4>${post.title}</h4>
      <p class="latest-post-date">${post.publishedAt ? formatDate(post.publishedAt) : ''}</p>
      <p class="latest-post-excerpt">${shortenedExcerpt}</p>
      <a href="${basePath}posts/${post.slug.current}.html" class="latest-post-link">Read Full Article</a>
    </div>
  `;
  
  container.innerHTML = postHtml;
  
  // Show the container
  const latestPostSection = document.querySelector('.latest-post');
  if (latestPostSection) {
    latestPostSection.style.display = 'block';
  }
}

// Hide the latest post section if no posts are found
function hideLatestPostSection() {
  const latestPostSection = document.querySelector('.latest-post');
  if (latestPostSection) {
    latestPostSection.style.display = 'none';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchLatestBlogPost); 