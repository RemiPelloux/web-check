#!/bin/bash
# Start backend API
DISABLE_GUI=true PORT=3001 node server.js &

# Start Astro production server
HOST=0.0.0.0 node dist/server/entry.mjs &

# Wait for all processes
wait


