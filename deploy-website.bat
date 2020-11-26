@echo off

set MARKETINGFOLDER="cosmatt-marketing"
set /P ENV="select the environment are you building for? [dev/stg/prod]: "
REM set ENV="dev"

echo "Navigating to Marketing site folder"
call cd %MARKETINGFOLDER%

set /P INSTALL="Would you like to Install dependencies(npm install) for Cosmatt-Marketing [y/n]:"

if "%INSTALL%"=="y" (
  call npm install
)

echo "Building Marketing Site"
call gulp build

echo "Navigating Back to Root Folder"
call cd ../

echo "deploying marketing website to s3..."
call gulp s3-website-deploy --env=%ENV%

echo "copying and uploading global assets to s3..."
call gulp global-assets-upload --env=%ENV%

echo "deployment completed successfully!"
pause

