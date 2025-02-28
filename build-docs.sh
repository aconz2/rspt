#!/usr/bin/env bash

set -e

rm -rf docs
npm run build
mv dist docs
git add docs
