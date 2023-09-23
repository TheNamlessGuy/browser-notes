#!/bin/bash

if [[ -f './browser-notes.zip' ]]; then
  \rm -i './browser-notes.zip'
  if [[ -f './browser-notes.zip' ]]; then
    echo >&2 'Cannot continue while the old .zip exists'
    exit 1
  fi
fi

echo "Zipping..."
zip -r -q './browser-notes.zip' res/ src/ manifest.json