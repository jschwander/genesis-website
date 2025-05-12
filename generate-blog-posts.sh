#!/bin/bash

# This script generates HTML files for all your Sanity blog posts
echo "Generating HTML files for all blog posts..."
node sanity-post-generator.js

echo ""
echo "Done! Your blog posts are ready."
echo "Press any key to exit..."
read -n 1 