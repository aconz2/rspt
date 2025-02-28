#!/usr/bin/env bash

set -e

git rm -rf docs
npm run build
mv dist docs
git add docs
