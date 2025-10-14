const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToIco() {
  try {
    await sharp('public/images/logo/greysiliconfavicon.png')
      .resize(32, 32)
      .toFile('public/favicon.ico');
    console.log('Favicon.ico created successfully!');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

convertToIco();
