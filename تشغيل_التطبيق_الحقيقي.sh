#!/bin/bash
cd "$(dirname "$0")"
npx -y electron@28 main.js &
