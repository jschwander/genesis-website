// Sanity integration for Genesis blog
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

// Generate excerpt from body text if none provided
function generateExcerpt(bodyText, maxLength = 150) {
  if (!bodyText) return 'No excerpt available';
  
  // If bodyText is an array of blocks (Portable Text)
  if (Array.isArray(bodyText)) {
    // Get text from first paragraph block
    const textBlocks = bodyText.filter(block => block._type === 'block' && block.style === 'normal');
    if (textBlocks.length > 0) {
      // Get text from the first paragraph
      bodyText = textBlocks[0].children
        .map(child => child.text)
        .join('');
    } else {
      return 'No excerpt available';
    }
  }
  
  if (bodyText.length <= maxLength) return bodyText;
  
  // Truncate at last space before maxLength
  const truncated = bodyText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// Fetch blog posts from Sanity
async function fetchBlogPosts() {
  try {
    // GROQ query to get posts with related data
    const query = encodeURIComponent(`
      *[_type == "post"] | order(publishedAt desc) {
        title,
        slug,
        excerpt,
        body,
        publishedAt,
        "imageUrl": mainImage.asset->url,
        "categories": categories[]->title,
        "author": author->name
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
    console.log('Sanity response:', data);
    
    if (data.result && data.result.length > 0) {
      renderBlogPosts(data.result);
    } else {
      displayNoPosts();
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    displayError();
  }
}

// Render blog posts to the page
function renderBlogPosts(posts) {
  const container = document.querySelector('.blog-grid');
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Add each post
  posts.forEach(post => {
    // Get excerpt from dedicated field or generate from body
    const postExcerpt = post.excerpt || generateExcerpt(post.body);
    const fullExcerpt = post.excerpt || generateExcerpt(post.body, 500); // Get longer version for tooltip
    
    // Create the HTML for the blog card
    const postHtml = `
      <article class="blog-card">
        <div class="blog-image">
          ${post.imageUrl ? 
            `<img src="${post.imageUrl}?w=500&h=300&fit=crop" alt="${post.title}">` : 
            '<div class="placeholder-image"></div>'
          }
        </div>
        <div class="blog-card-content">
          <div class="blog-meta">
            <span class="blog-date">${post.publishedAt ? formatDate(post.publishedAt) : 'Unpublished'}</span>
            ${post.categories && post.categories.length > 0 ? 
              `<span class="blog-category">${post.categories[0]}</span>` : 
              ''
            }
          </div>
          <h2>${post.title}</h2>
          <p class="blog-excerpt" data-full-text="${fullExcerpt.replace(/"/g, '&quot;')}">${postExcerpt}</p>
          <span class="blog-excerpt-toggle" data-action="expand">Click to read more</span>
          <a href="posts/${post.slug.current}.html" class="blog-read-more">Read Full Article</a>
        </div>
      </article>
    `;
    
    // Add to container
    container.innerHTML += postHtml;
  });
  
  // Add click event listeners for excerpt expansion
  addExcerptToggleListeners();
}

// Display message when no posts are found
function displayNoPosts() {
  const container = document.querySelector('.blog-grid');
  if (!container) return;
  
  container.innerHTML = `
    <div class="no-posts-message">
      <h2>No blog posts found</h2>
      <p>Check back soon for new content!</p>
    </div>
  `;
}

// Display error message
function displayError() {
  const container = document.querySelector('.blog-grid');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-message">
      <h2>Unable to load blog posts</h2>
      <p>There was an error loading the blog posts. Please try again later.</p>
    </div>
  `;
}

// Add click event listeners for excerpt expansion
function addExcerptToggleListeners() {
  const excerpts = document.querySelectorAll('.blog-excerpt');
  const toggles = document.querySelectorAll('.blog-excerpt-toggle');
  
  excerpts.forEach((excerpt, index) => {
    const toggle = toggles[index];
    if (!toggle) return;
    
    const originalText = excerpt.textContent;
    const fullText = excerpt.getAttribute('data-full-text');
    
    // Click on excerpt text
    excerpt.addEventListener('click', () => toggleExcerpt(excerpt, toggle, originalText, fullText));
    
    // Click on toggle button
    toggle.addEventListener('click', () => toggleExcerpt(excerpt, toggle, originalText, fullText));
  });
}

// Toggle excerpt expansion
function toggleExcerpt(excerpt, toggle, originalText, fullText) {
  const isExpanded = excerpt.classList.contains('expanded');
  
  if (isExpanded) {
    // Collapse
    excerpt.classList.remove('expanded');
    excerpt.textContent = originalText;
    toggle.textContent = 'Click to read more';
    toggle.setAttribute('data-action', 'expand');
  } else {
    // Expand
    excerpt.classList.add('expanded');
    excerpt.textContent = fullText;
    toggle.textContent = 'Show less';
    toggle.setAttribute('data-action', 'collapse');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchBlogPosts); 