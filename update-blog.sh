#!/bin/bash

# Simple script to update blog posts and push to GitHub

echo "=== Generating Blog Post HTML Files ==="
node sanity-post-generator.js

echo ""
echo "=== Committing Changes to GitHub ==="
git add posts/*.html
git commit -m "Update blog post HTML files"
git push

echo ""
echo "=== All Done! ==="
echo "Your blog posts are now updated and should be live in a few minutes."
echo ""
echo "Press any key to exit..."
read -n 1 