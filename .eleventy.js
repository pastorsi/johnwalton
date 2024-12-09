require('dotenv').config({ path: './src/.env' }); // Load environment variables from the .env file

// Warn if required environment variables are missing
if (!process.env.W3F_API_KEY) {
  console.warn("Warning: Web3Forms API key (W3F_API_KEY) is not defined in the environment variables.");
}

// Optional: Exit process if critical variables are missing
if (!process.env.W3F_API_KEY) {
  console.error("Error: Web3Forms API key (W3F_API_KEY) is missing. Exiting process.");
  process.exit(1); // Exit the process to prevent deployment
}

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const { exec } = require('child_process');
const NOT_FOUND_PATH = "_site/404.html";

module.exports = function(eleventyConfig) {
  // Passthrough Copy for assets
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/js');

  // Add Eleventy Plugins
  eleventyConfig.addPlugin(pluginRss);

  // Add Global Data for environment variables
  eleventyConfig.addGlobalData('env', process.env);

  // PageFind Integration
  eleventyConfig.on('eleventy.after', async () => {
    await delay(2000); // Delay before running Pagefind

    try {
      await execCommand('npx pagefind --site _site --output-subdir pagefind --glob "**/*.html"');
    } catch (error) {
      console.error('Error running Pagefind:', error.message);
    }
  });

  function execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { encoding: 'utf-8' }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enable collections in descending order
  eleventyConfig.addCollection('posts', collection => {
    return collection.getFilteredByGlob('./src/posts/**/*.md').reverse();
  });

  // Shortcodes for dynamic content
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Filters for date formatting
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy');
  });

  // Favicon Generation
  eleventyConfig.on('eleventy.before', async () => {
    console.log('[11ty] Generating Favicon');
    try {
      const possiblePaths = [
        'src/assets/images/favicon.svg',
        'assets/images/favicon.svg'
      ];

      let inputPath;
      for (const pathOption of possiblePaths) {
        const absolutePath = path.resolve(process.cwd(), pathOption);
        if (fs.existsSync(absolutePath)) {
          inputPath = absolutePath;
          break;
        }
      }

      if (!inputPath) {
        console.error('[11ty] ERROR: Input file not found in any expected location.');
        return;
      }

      console.log(`[11ty] Found input file: ${inputPath}`);
      const outputPath = path.resolve(process.cwd(), '_site/favicon.png');
      const rootPath = path.resolve(process.cwd(), 'favicon.png');

      await sharp(inputPath)
        .png()
        .resize(192, 192)
        .toFile(outputPath)
        .catch(err => {
          console.error('[11ty] ERROR Generating favicon:', err.message);
          throw err;
        });

      fs.copyFileSync(outputPath, rootPath);
      console.log('[11ty] Favicon generated and copied to root directory');
    } catch (error) {
      console.error('[11ty] Error during favicon generation:', error.message);
    }
  });

  // Ignore files in the watch config
  eleventyConfig.watchIgnores.add('_site/favicon.png');
  eleventyConfig.watchIgnores.add('favicon.png');
  eleventyConfig.watchIgnores.add('_site/assets/images/icon-96x96.png');

  // Eleventy configuration
  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: [
      'html',
      'md',
      'njk'
    ],
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk"
  };
};
