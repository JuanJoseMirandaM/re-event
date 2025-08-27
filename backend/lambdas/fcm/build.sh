#!/bin/bash

# Install dependencies
npm install

# Create zip file
zip -r register-fcm-token.zip register-fcm-token.js node_modules

echo "FCM lambda built successfully!"
