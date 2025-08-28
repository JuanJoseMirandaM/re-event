#!/bin/bash

# Install dependencies
npm install

# Create zip files
zip -r create-notification.zip create-notification.js node_modules
zip -r get-notifications.zip get-notifications.js node_modules

echo "Notifications lambdas built successfully!"
