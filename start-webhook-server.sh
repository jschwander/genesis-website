#!/bin/bash

# Start the Sanity webhook server
echo "Starting Sanity webhook server..."
node sanity-webhook-server.js &

# Save the process ID
echo $! > sanity-webhook.pid
echo "Webhook server started with PID: $!"
echo "To stop the server: kill $(cat sanity-webhook.pid)"
echo "Server running at http://localhost:3000/webhook" 