#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Creating zip files..."
zip -r create-notification.zip create-notification.js node_modules
zip -r get-notifications.zip get-notifications.js node_modules

echo "Notifications lambdas built successfully!"
echo "Note: Firebase Admin SDK is now included for FCM sending"
