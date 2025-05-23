// Sanity blog post detail integration
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

// Get the slug from the URL
function getSlugFromUrl() {
  const path = window.location.pathname;
  const filename = path.split('/').pop();
  return filename.replace('.html', '');
}

// Convert Sanity's Portable Text to HTML
function portableTextToHtml(blocks) {
  if (!blocks || !Array.isArray(blocks)) {
    return '<p>No content available</p>';
  }

  return blocks.map(block => {
    // Handle different block types
    if (block._type === 'block') {
      let text = block.children
        .map(child => {
          let text = child.text;
          
          // Apply marks (bold, italic, etc.)
          if (child.marks && child.marks.length > 0) {
            child.marks.forEach(mark => {
              // Handle basic text formatting marks
              if (mark === 'strong') text = `<strong>${text}</strong>`;
              if (mark === 'em') text = `<em>${text}</em>`;
              if (mark === 'code') text = `<code>${text}</code>`;
              if (mark === 'sup') text = `<sup>${text}</sup>`;
              if (mark === 'sub') text = `<sub>${text}</sub>`;
              
              // Handle annotations (links, colors) by checking markDefs
              if (block.markDefs && block.markDefs.length > 0) {
                const markDef = block.markDefs.find(def => def._key === mark);
                if (markDef) {
                  // Handle links
                  if (markDef._type === 'link' && markDef.href) {
                    text = `<a href="${markDef.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                  }
                  // Handle colors
                  if (markDef._type === 'color' && markDef.hex) {
                    text = `<span style="color:${markDef.hex}">${text}</span>`;
                  }
                }
              }
            });
          }
          
          return text;
        })
        .join('');

      // Apply different styles based on the block style
      switch (block.style) {
        case 'h1': return `<h1>${text}</h1>`;
        case 'h2': return `<h2>${text}</h2>`;
        case 'h3': return `<h3>${text}</h3>`;
        case 'h4': return `<h4>${text}</h4>`;
        case 'blockquote': return `<blockquote><p>${text}</p></blockquote>`;
        case 'center': return `<div style="text-align:center">${text}</div>`;
        default: return `<p>${text}</p>`;
      }
    }
    
    // Handle images
    if (block._type === 'image' && block.asset) {
      const imageUrl = `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`;
      const caption = block.caption ? `<figcaption>${block.caption}</figcaption>` : '';
      return `
        <figure>
          <img src="${imageUrl}" alt="${block.alt || ''}" />
          ${caption}
        </figure>
      `;
    }
    
    return ''; // Return empty for unrecognized blocks
  }).join('');
}

// Fetch blog post by slug
async function fetchBlogPost() {
  try {
    const slug = getSlugFromUrl();
    
    // GROQ query to get the post with its related data
    const query = encodeURIComponent(`
      *[_type == "post" && slug.current == "${slug}"][0] {
        title,
        publishedAt,
        excerpt,
        body,
        "imageUrl": mainImage.asset->url,
        "author": author->{name, slug},
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
    console.log('Sanity response for post detail:', data);
    
    if (data.result) {
      renderBlogPost(data.result);
      document.title = `${data.result.title} - Genesis Building Company`;
    } else {
      displayNotFound();
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
    displayError();
  }
}

// Render the blog post content to the page
function renderBlogPost(post) {
  // Update meta info
  const metaTitle = document.querySelector('title');
  if (metaTitle) metaTitle.textContent = `${post.title} - Genesis Building Company`;
  
  // Update blog post header
  const titleElement = document.querySelector('.blog-post-title');
  if (titleElement) titleElement.textContent = post.title;
  
  // Update date
  const dateElement = document.querySelector('.post-date span');
  if (dateElement && post.publishedAt) dateElement.textContent = formatDate(post.publishedAt);
  
  // Update author
  const authorElement = document.querySelector('.post-author span');
  if (authorElement && post.author) authorElement.textContent = post.author.name;
  
  // Update category
  const categoryElement = document.querySelector('.post-category span');
  if (categoryElement && post.categories && post.categories.length > 0) {
    categoryElement.textContent = post.categories[0];
  }
  
  // Update featured image
  const featuredImage = document.querySelector('.featured-image');
  if (featuredImage && post.imageUrl) {
    // Set the src attribute which will trigger the image loading
    featuredImage.src = `${post.imageUrl}?w=1200&h=675&fit=crop`;
    featuredImage.alt = post.title;
    
    // Remove loading indicator when image is fully loaded
    featuredImage.onload = function() {
      // Add the 'loaded' class to fade in the image
      this.classList.add('loaded');
      
      // Optionally hide the loading spinner
      const imageLoading = document.querySelector('.image-loading');
      if (imageLoading) {
        setTimeout(() => {
          imageLoading.style.display = 'none';
        }, 300); // Short delay for smoother transition
      }
    };
  } else {
    // Hide the image container if no image is available
    const imageContainer = document.querySelector('.featured-image-container');
    if (imageContainer) imageContainer.style.display = 'none';
  }
  
  // Update blog post content
  const bodyElement = document.querySelector('.blog-post-body');
  if (bodyElement && post.body) {
    bodyElement.innerHTML = portableTextToHtml(post.body);
  }
  
  // Fetch related posts
  fetchRelatedPosts(post.categories);
}

// Fetch related posts based on categories
async function fetchRelatedPosts(categories) {
  if (!categories || categories.length === 0) return;
  
  try {
    const category = categories[0];
    const currentSlug = getSlugFromUrl();
    
    // GROQ query to get related posts
    const query = encodeURIComponent(`
      *[_type == "post" && "${category}" in categories[]->title && slug.current != "${currentSlug}"][0..2] {
        title,
        slug,
        excerpt,
        publishedAt,
        "imageUrl": mainImage.asset->url
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
    console.log('Sanity response for related posts:', data);
    
    if (data.result && data.result.length > 0) {
      renderRelatedPosts(data.result);
    } else {
      const relatedSection = document.querySelector('.related-posts');
      if (relatedSection) relatedSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching related posts:', error);
    const relatedSection = document.querySelector('.related-posts');
    if (relatedSection) relatedSection.style.display = 'none';
  }
}

// Render related posts
function renderRelatedPosts(posts) {
  const container = document.querySelector('.related-posts-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  posts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.className = 'blog-card';
    
    postElement.innerHTML = `
      <div class="blog-image">
        ${post.imageUrl ? 
          `<img src="${post.imageUrl}?w=400&h=250&fit=crop" alt="${post.title}">` : 
          '<div class="placeholder-image"></div>'
        }
      </div>
      <div class="blog-card-content">
        <div class="blog-meta">
          <span class="blog-date">${post.publishedAt ? formatDate(post.publishedAt) : 'Unpublished'}</span>
        </div>
        <h2>${post.title}</h2>
        <p>${post.excerpt || ''}</p>
        <a href="${post.slug.current}.html" class="blog-read-more">Read More</a>
      </div>
    `;
    
    container.appendChild(postElement);
  });
}

// Display not found message
function displayNotFound() {
  const titleElement = document.querySelector('.blog-post-title');
  if (titleElement) titleElement.textContent = 'Blog Post Not Found';
  
  const bodyElement = document.querySelector('.blog-post-body');
  if (bodyElement) {
    bodyElement.innerHTML = `
      <div class="error-message">
        <p>The blog post you're looking for could not be found. It may have been moved or deleted.</p>
        <p><a href="../blog.html">Return to Blog</a></p>
      </div>
    `;
  }
  
  // Hide the image container
  const imageContainer = document.querySelector('.featured-image-container');
  if (imageContainer) imageContainer.style.display = 'none';
  
  const metaElements = document.querySelector('.blog-post-meta');
  if (metaElements) metaElements.style.display = 'none';
  
  const relatedSection = document.querySelector('.related-posts');
  if (relatedSection) relatedSection.style.display = 'none';
}

// Display error message
function displayError() {
  const titleElement = document.querySelector('.blog-post-title');
  if (titleElement) titleElement.textContent = 'Error Loading Blog Post';
  
  const bodyElement = document.querySelector('.blog-post-body');
  if (bodyElement) {
    bodyElement.innerHTML = `
      <div class="error-message">
        <p>There was an error loading this blog post. Please try again later.</p>
        <p><a href="../blog.html">Return to Blog</a></p>
      </div>
    `;
  }
  
  // Hide the image container
  const imageContainer = document.querySelector('.featured-image-container');
  if (imageContainer) imageContainer.style.display = 'none';
  
  const metaElements = document.querySelector('.blog-post-meta');
  if (metaElements) metaElements.style.display = 'none';
  
  const relatedSection = document.querySelector('.related-posts');
  if (relatedSection) relatedSection.style.display = 'none';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchBlogPost); 