#!/bin/bash

# PrintiFy Print Hub Launcher Script

echo "Starting PrintiFy Print Hub..."
echo "Connecting to API: https://printifyapp-564e0522a8a7.herokuapp.com/"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
npm start 