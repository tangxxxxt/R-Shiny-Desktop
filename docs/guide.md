# Full Guide: Package an R Shiny App as a Windows Desktop App

This guide shows how to turn an R Shiny app into a Windows desktop app using Electron.

The workflow is designed for apps whose R dependencies cannot all be installed from CRAN. Examples include:

- `INLA`, which uses its own repository.
- Private or public GitHub packages.
- Local R packages under active development.

## Source and Acknowledgement

This tutorial is based on practice inspired by the Tencent Cloud article [R Shiny 打包成桌面应用程序](https://cloud.tencent.com/developer/article/1957899).

The original article explains the core packaging idea: use Electron, `electron-packager`, and a portable R runtime to launch a Shiny app as a desktop program. This guide keeps that core idea, but updates several details that may no longer work reliably in newer environments:

- `registry.npm.taobao.org` is obsolete, so this guide uses current npm mirror settings.
- Some old Electron mirror paths return 404, so this guide explains how to handle Electron download versions and `electron_custom_dir`.
- Very old Electron versions can cause UI and file-upload differences in modern Shiny apps, so this guide recommends a newer Electron runtime.
- Many real Shiny apps depend on non-CRAN packages such as `INLA` or GitHub packages, so this guide adds a dependency installation workflow for bundled R.
- The guide also adds notes about `www/` resources, user-writable directories, random ports, and release testing.

Please respect the original article's contribution and credit it when reusing this workflow.

All paths below are examples. Replace them with your own paths.

```text
C:\Projects\MyShinyDesktop
C:\Projects\MyShinyDesktop\electron-app
C:\Projects\MyShinyDesktop\R-Portable-Win
```

## 1. Prepare the Working Directory

Create a working folder:

```powershell
mkdir C:\Projects\MyShinyDesktop
cd C:\Projects\MyShinyDesktop
```

Suggested structure:

```text
MyShinyDesktop/
  electron-app/
  R-Portable-Win/
  source-app/
    app.R
    www/
  scripts/
```

Important rule:

Do not hard-code your own local paths in `app.R`, such as:

```r
"D:/my/local/folder/www"
```

Those paths will not exist on the user's computer.

## 2. Install Node.js and Configure npm

Install Node.js x64.

Check:

```powershell
node -v
npm -v
```

If you are in China or your network has trouble reaching npm, use a mirror:

```powershell
npm config set registry https://registry.npmmirror.com
```

For Electron downloads, prefer environment variables during install or packaging:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

If you previously set an old Electron custom directory, delete it:

```powershell
npm config delete electron_custom_dir
```

Why this matters:

Old tutorials often set `electron_custom_dir` to a fixed version such as `5.0.13`. If you later upgrade Electron, npm may still download from the wrong directory.

## 3. Create the Electron Project

Create or clone an Electron app template:

```powershell
cd C:\Projects\MyShinyDesktop
git clone https://github.com/electron/electron-quick-start.git electron-app
cd electron-app
```

Install Electron and packager locally:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install electron@13.6.9 --save-dev
npm install electron-packager@15.2.0 --save-dev
```

Do not rely on a global `electron-packager` installation. A local dev dependency is more reproducible.

## 4. Prepare the Bundled R Runtime

The final desktop app should use the R runtime inside:

```text
electron-app/R-Portable-Win/bin/Rscript.exe
```

It should not rely on:

```text
C:\Program Files\R\R-x.y.z
```

Copy a complete Windows x64 R installation into:

```text
electron-app/R-Portable-Win
```

Expected file:

```text
electron-app/R-Portable-Win/bin/Rscript.exe
```

Check:

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
.\R-Portable-Win\bin\Rscript.exe -e "R.version.string"
```

Important:

RStudio may use your system R during development. That is fine. But the packaged app will use `R-Portable-Win`. Therefore all required packages must be installed into `R-Portable-Win`, not only into your system R.

## 5. Install R Dependencies into the Bundled R

Always run dependency installation through:

```text
electron-app/R-Portable-Win/bin/Rscript.exe
```

Basic CRAN packages:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages(c('shiny','bs4Dash','DT','dplyr'), repos='https://cloud.r-project.org')"
```

### Install INLA

`INLA` is not installed like ordinary CRAN-only packages. Use the R-INLA repository:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('INLA', repos=c(INLA='https://inla.r-inla-download.org/R/stable', CRAN='https://cloud.r-project.org'), dependencies=TRUE)"
```

If you need the testing repository:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('INLA', repos=c(INLA='https://inla.r-inla-download.org/R/testing', CRAN='https://cloud.r-project.org'), dependencies=TRUE)"
```

### Install a GitHub Package

Install `remotes` first:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('remotes', repos='https://cloud.r-project.org')"
```

Install a public GitHub package:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-package>', dependencies=TRUE, upgrade='never')"
```

For a private repository, set a token first:

```powershell
$env:GITHUB_PAT="your_token_here"
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-private-package>', dependencies=TRUE, upgrade='never')"
```

### Install a Local Package

For active development, local installation is often more stable than GitHub:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_local('C:/Projects/MyShinyDesktop/source-package', dependencies=TRUE, upgrade='never')"
```

### Verify

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "library(shiny); library(INLA); library(<yourPackage>); cat('OK\n')"
```

## 6. Prepare `app.R` and Static Files

Place your Shiny entry file here:

```text
electron-app/app.R
```

Place images, CSS, JavaScript, and other Shiny static resources here:

```text
electron-app/www
```

Shiny automatically serves a `www/` folder located beside `app.R`.

If you manually map resources, use the app directory instead of absolute local paths:

```r
app_dir <- Sys.getenv("SHINY_DESKTOP_APP_DIR", unset = "")
if (!nzchar(app_dir) || !dir.exists(app_dir)) {
  app_dir <- getwd()
}
app_dir <- normalizePath(app_dir, winslash = "/", mustWork = FALSE)

resource_dir <- file.path(app_dir, "www")
if (dir.exists(resource_dir)) {
  shiny::addResourcePath("assets", resource_dir)
}
```

Avoid:

```r
shiny::addResourcePath("assets", "D:/my/local/www")
```

That will work only on your own computer.

## 7. Use a Robust `main.js`

Electron should:

- Start the bundled `Rscript.exe`.
- Use a random port to avoid conflicts.
- Pass the real app directory to R through an environment variable.
- Use a user-writable working directory and temporary directory.

See:

[templates/main.js](../templates/main.js)

Core idea:

```js
const appDir = app.getAppPath()
const port = String(10000 + Math.floor(Math.random() * 50000))

child.spawn(
  execPath,
  ["-e", `shiny::runApp(file.path('${appPath}'), port=${port})`],
  {
    cwd: app.getPath("documents"),
    env: Object.assign({}, process.env, {
      SHINY_DESKTOP_APP_DIR: appDir
    })
  }
)
```

Why random port matters:

Fixed ports such as `9191` can accidentally connect Electron to an old Shiny process, especially when the app was opened multiple times or did not close cleanly.

## 8. Configure `package.json`

Example:

```json
{
  "name": "my-shiny-app",
  "version": "1.0.0",
  "description": "My Shiny desktop app",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "package-win": "electron-packager . --overwrite --platform=win32 --arch=x64 --executable-name=setup --out=release --version-string.ProductName=\"My Shiny App\""
  },
  "devDependencies": {
    "electron": "13.6.9",
    "electron-packager": "15.2.0"
  }
}
```

Use a newer Electron if your Shiny UI uses modern browser features. Very old Electron versions can cause:

- File upload UI not updating.
- `bs4Dash` controls rendering differently.
- DataTables or Bootstrap behavior differing from Chrome/Edge.

## 9. Test Before Packaging

Test R directly:

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
$env:SHINY_DESKTOP_APP_DIR=(Get-Location).Path
.\R-Portable-Win\bin\Rscript.exe -e "shiny::runApp('app.R', port=9191, launch.browser=FALSE)"
```

Open:

```text
http://127.0.0.1:9191
```

Then test Electron:

```powershell
npm start
```

Only package after both tests work.

## 10. Package for Windows

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm run package-win
```

The output is usually:

```text
release/my-shiny-app-win32-x64
```

Rename it if desired:

```text
MyShinyApp_1.0.0_win_x64
```

Users should run:

```text
setup.exe
```

inside the full folder.

## 11. What to Send to Users

Send the whole folder:

```text
MyShinyApp_1.0.0_win_x64
```

or a zip made from the whole folder.

Do not send only:

```text
setup.exe
```

The executable depends on files beside it, especially:

```text
resources/app/R-Portable-Win
resources/app/www
resources/app/app.R
```

## 12. Release Checklist

Before sending to users:

- `setup.exe` starts the app.
- `www/` images load in the desktop app.
- CSV upload works.
- Excel upload works if supported.
- Shapefile upload works with `.shp`, `.dbf`, `.shx`, `.prj`, and optional `.cpg`.
- Model package loads from bundled R.
- `INLA` loads from bundled R.
- The app works after moving the release folder to another path.
- No hard-coded local path remains in `app.R`.
- Old app instances are closed before testing.
