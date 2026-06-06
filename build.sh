#!/bin/bash
set -e
mkdir -p dist

if [ "$DEMO" = "true" ]; then
  sed 's|</head>|<script>window.PIG_IRON_DEMO=true;</script></head>|' index.html > dist/index.html
else
  cp index.html dist/index.html
fi

cp manifest.json dist/
cp sw.js dist/
