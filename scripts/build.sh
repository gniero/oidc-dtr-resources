#!/bin/bash

# This script automates the process of converting the Markdown file to XML using MMARK
# and then converting the XML to HTML using XML2RFC.

# Exit immediately if a command exits with a non-zero status
set -e

# Define the input and output files
MARKDOWN_FILE="openid-deferred-token-response-1_0.md"
XML_FILE="openid-deferred-token-response-1_0.xml"
HTML_FILE="index.html"

# Convert Markdown to XML using MMARK
mmark $MARKDOWN_FILE > $XML_FILE

# Convert XML to HTML using XML2RFC
xml2rfc $XML_FILE --text --html --v3 -o $HTML_FILE

# Clean up the XML file if needed
rm $XML_FILE

# Notify the user of completion
echo "Build completed: $HTML_FILE generated."