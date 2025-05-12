tell application "Terminal"
	-- Open Terminal and run the script
	do script "cd ~/Desktop/Website && ./generate-blog-posts.sh"
	activate
end tell 