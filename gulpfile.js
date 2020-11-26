var gulp = require('gulp');
var exec = require('child_process').exec;
var argv = require('yargs').argv;
var s3 = require('s3');
const fs = require('fs-extra');
const assert = require('assert');
const path = require('path');
const mime = require('mime-types');

var s3Client = s3.createClient({
  s3Options: {
    accessKeyId: argv.accessKeyId || 'AKIAI53MOQOL4PT5QYEQ',
    secretAccessKey: argv.secretAccessKey || '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',
    region: 'us-east-1'
  }
});

var config = {
  dev: {
    s3Bucket: 'cosmatt-dev.comprodls.com',
    ngAppUrl: 'https://cosmatt-dev.comprodls.com/app/'
  },
  stg: {
    s3Bucket: 'cosmatt-stg.comprodls.com',
    ngAppUrl: 'https://cosmatt-stg.comprodls.com/app/'
  },
  prod: {
    s3Bucket: 'cosmatt.comprodls.com',
    ngAppUrl: 'https://cosmatt.comprodls.com/app/'
  },
  globalAssetsPath: path.resolve(__dirname, 'assets'),
  otherAssets: [{
    name: 'cosmatt-marketing',
    path: path.resolve(__dirname, 'cosmatt-marketing', 'dist', 'assets'),
    createAssetFolder: false
  }]
}

argv.env = argv.env || 'dev';

// Task to build angular app
gulp.task('ng-build', function () {
  console.log("Building for environment", argv.env, "...");
  return new Promise(function (resolve, reject) {
    exec(`ng build --prod --no-progress --base-href ${config[argv.env].ngAppUrl} --env ` + argv.env, function (error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      console.log(stdout);
      console.log('build completed successfully!');
      resolve();
    });
  })
});

// Task to run gulp on marketing site
gulp.task('gulp-marketing', function () {
  console.log("Building for environment", argv.env, "...");
  return new Promise(function (resolve, reject) {
    exec('gulp ./cosmatt-marketing/dist/gulpfile.js', function (error, stdout, stderr) {
      if (error) {
        return reject(error);
      }
      console.log(stdout);
      console.log('gulp-marketing completed successfully!');
      resolve();
    });
  })
});

// Task to deploy angular app to s3
gulp.task('s3-deploy', ['ng-build'], function () {
  return new Promise((resolve, reject) => {
    const params = {
      localDir: './dist',
      deleteRemoved: true,
      s3Params: {
        Bucket: config[argv.env].s3Bucket,
        Prefix: "app/",
        CacheControl: 'public, max-age=31536000, immutable',
      },
    };

    // Upload the dist folder
    uploadToS3(params, true)
      .then(() => {
        // Also re-upload index.html with no-cache.
        // https://stackoverflow.com/questions/18774069/amazon-cloudfront-cache-control-no-cache-header-has-no-effect-after-24-hours?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
        // CacheControl = public, must-revalidate, proxy-revalidate, max-age=0
        const indexParams = {
          localFile: './dist/index.html',
          deleteRemoved: true,
          s3Params: {
            Bucket: config[argv.env].s3Bucket,
            Key: "app/index.html",
            CacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0',
          },
        };

        return uploadToS3(indexParams, false);
      })
      .then(resolve)
      .catch(reject);
  });
});

// Task to run gulp on marketing and push it to s3 at path /
gulp.task('s3-website-deploy', function () {
  return new Promise(function (resolve, reject) {
    const distPath = path.resolve(__dirname, 'cosmatt-marketing', 'dist');
    const filePaths = fs.readdirSync(distPath)
                        .filter(itemPath => fs.lstatSync(path.resolve(distPath, itemPath)).isFile())
                        .map(itemPath => path.resolve(distPath, itemPath));

    // Upload all the files inside dist folder
    const fileUploadPromises = [];
    filePaths.forEach(filePath => {
      const params = {
        localFile: filePath,
        deleteRemoved: true,
        s3Params: {
          Bucket: config[argv.env].s3Bucket,
          Key: path.basename(filePath),
          CacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0'
        }
      };
      // Push to fileUploadPromise array
      fileUploadPromises.push(uploadToS3(params, false));
    });

    // Resolve when all files have been uploaded
    Promise.all(fileUploadPromises)
      .then(resolve)
      .catch(reject);
  });
});

// Task to copy global assets in project root directory.
gulp.task('copy-global-assets', function createGlobalAssets() {
  return new Promise((resolve, reject) => {
    // Check if assets folder exists or not
    assert.equal(fs.pathExistsSync(config.globalAssetsPath), true, `Global assets folder does not exist.`);

    config.otherAssets.forEach(asset => {
      const sourcePath = asset.path;

      // Check if source destination of assets exists.
      assert.equal(fs.pathExistsSync(sourcePath), true, `Assets path [${sourcePath}] does not exist.`);

      // Create own folder with the name `asset.name` inside assets folder if `createAssetFolder` is true
      let destinationPath = path.resolve(config.globalAssetsPath);
      if (asset.createAssetFolder) {
        destinationPath = path.resolve(config.globalAssetsPath, asset.name);
      }

      // Copy from assetsPath to the directory inside ./assets/<applicationName>/
      fs.copySync(sourcePath, destinationPath, {
        overwrite: true,
        preserveTimestamps: true
      });
    });

    resolve('Done copying global assets.');
  });
});

// Taks to upload global assets folder to s3
gulp.task('global-assets-upload', ['copy-global-assets'], function globalAssetsUpload() {
  return new Promise(function (resolve, reject) {
    const params = {
      localDir: './assets',
      deleteRemoved: false,
      s3Params: {
        Prefix: "assets/",
        Bucket: config[argv.env].s3Bucket,
        CacheControl: 'public, max-age=31536000, immutable'
      }
    };

    uploadToS3(params, true)
      .then(resolve)
      .catch(reject);
  });
});

// Helper function to upload files and directories to S3
function uploadToS3(params, isDirectory) {
  return new Promise((resolve, reject) => {

    let uploaderObj;
    if (isDirectory)
      uploaderObj = s3Client.uploadDir(params);
    else
      uploaderObj = s3Client.uploadFile(params);

    let prevProgress = 0;
    uploaderObj.on('progress', function () {
      if (prevProgress !== uploaderObj.progressAmount) {
        console.log(`Progress: ${Math.round(uploaderObj.progressAmount / uploaderObj.progressTotal * 100)}%`);
        prevProgress = uploaderObj.progressAmount;
      }
    });

    uploaderObj.on('error', (error) => {
      reject(error);
    });

    uploaderObj.on('end', () => {
      if (prevProgress === 0)
        console.log('Nothing to upload. Already up to date.');
      resolve('Done uploading.');
    })

  });
}
