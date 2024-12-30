#!/bin/bash

# MediaBlocker Setup Script
# This script sets up the environment for developing and testing the MediaBlocker Chrome extension.

echo "Starting MediaBlocker setup..."

# Check if Google Chrome is installed
if ! command -v google-chrome &> /dev/null
then
    echo "Google Chrome could not be found. Please install Google Chrome to proceed."
    exit
fi

echo "Google Chrome is installed."

# Instructions to load the extension in Chrome
echo "To load the MediaBlocker extension in Chrome:"
echo "1. Open Google Chrome."
echo "2. Navigate to chrome://extensions/."
echo "3. Enable 'Developer mode' by toggling the switch in the top right corner."
echo "4. Click on 'Load unpacked' and select the 'MediaBlocker_SourceFiles' directory from the cloned repository."

# Additional setup steps (if any)
# For example, if a local server is needed for testing, instructions or commands to set it up can be added here.

echo "MediaBlocker setup completed successfully."
