# Route A: Direct `app.R` Workflow

This route packages a Shiny app that is started directly from an `app.R` file.

Use this route when:

- your project already has a working `app.R`;
- you do not want to convert the app into an R package first;
- some dependencies are not simple CRAN installs;
- the final user should run a desktop app without installing R or R packages.

Even though this route starts from an `app.R` file, the desktop app should still include a bundled R runtime, such as `R-Portable-Win`. Otherwise the app will accidentally depend on the user's system R installation.

This tutorial is based on practice inspired by the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899). The original article introduced the core idea of using Electron, `electron-quick-start`, `electron-packager`, and portable R. This version updates the workflow for newer npm mirrors, Electron downloads, modern Shiny interfaces, and non-CRAN dependencies.

All paths below are examples. Replace them with your own paths.

```text
C:\Projects\MyShinyDesktop
C:\Projects\MyShinyDesktop\electron-app
C:\Projects\MyShinyDesktop\electron-app\R-Portable-Win
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
  source-app/
    app.R
    www/
  scripts/
```

Important rule:

Do not hard-code your own local paths in `app.R`.

Bad:

```r
"D:/my/local/project/www"
```

Good:

```r
file.path(app_dir, "www")
```

## 2. Install Node.js and Configure npm

Install Node.js x64, then check:

```powershell
node -v
npm -v
```

If your network has trouble reaching npm, set a current mirror:

```powershell
npm config set registry https://registry.npmmirror.com
```

For Electron downloads, use the mirror during install or packaging:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

If you previously followed an old tutorial, remove stale Electron settings:

```powershell
npm config delete electron_custom_dir
```

Old fixed settings such as `electron_custom_dir = v5.0.13` may cause 404 errors when the Electron version changes.

## 3. Create the Electron Project from `electron-quick-start`

Create the Electron template:

```powershell
cd C:\Projects\MyShinyDesktop
git clone https://github.com/electron/electron-quick-start.git electron-app
cd electron-app
```

Install Electron and `electron-packager` locally:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install electron@13.6.9 --save-dev
npm install electron-packager@15.2.0 --save-dev
```

Using local dev dependencies makes the build easier to reproduce than relying on a global `electron-packager`.

## 4. Add R-Portable to the Electron Template

Copy a complete Windows x64 R installation into the Electron project:

```text
electron-app/
  R-Portable-Win/
    bin/
      Rscript.exe
    library/
```

Verify:

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
.\R-Portable-Win\bin\Rscript.exe -e "R.version.string"
```

RStudio may use your normal system R during development. That is fine. The packaged desktop app should use `electron-app/R-Portable-Win`, so every required package must also be installed into this bundled R library.

## 5. Install R Dependencies into `R-Portable-Win`

Always install packages through the bundled R:

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
.\R-Portable-Win\bin\Rscript.exe -e "install.packages(c('shiny','DT','dplyr'), repos='https://cloud.r-project.org')"
```

If your app uses packages from special sources, install them into the same bundled R.

### Example: Package from a Special Repository

`INLA` is one example of a package that is not installed like ordinary CRAN-only packages. If your app uses `INLA`, use its repository:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('INLA', repos=c(INLA='https://inla.r-inla-download.org/R/stable', CRAN='https://cloud.r-project.org'), dependencies=TRUE)"
```

This is only an example. If your app does not use `INLA`, skip it.

### Example: GitHub Package

Install `remotes` first:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('remotes', repos='https://cloud.r-project.org')"
```

Then install your package:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-package>', dependencies=TRUE, upgrade='never')"
```

For a private repository:

```powershell
$env:GITHUB_PAT="your_token_here"
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-private-package>', dependencies=TRUE, upgrade='never')"
```

### Example: Local Package

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_local('C:/Projects/MyShinyDesktop/source-package', dependencies=TRUE, upgrade='never')"
```

### Verify Required Packages

Replace the package names with your own app's dependencies:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "library(shiny); library(DT); cat('OK\n')"
```

## 6. Copy `app.R` and `www/`

Copy your Shiny entry file:

```text
electron-app/app.R
```

If your app uses images, CSS, JavaScript, or other static resources, copy the whole `www/` folder:

```text
electron-app/www
```

Shiny automatically serves a `www/` folder located beside `app.R`.

If your app uses `addResourcePath()`, use the app directory instead of an absolute local path:

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

## 7. Replace Electron `main.js`

Electron should start the bundled `Rscript.exe`, open the Shiny URL, and pass the real app folder to R.

Use [templates/main.js](../templates/main.js) as a starting point.

The important ideas are:

- start `R-Portable-Win/bin/Rscript.exe`;
- use a random port to avoid conflicts;
- set a user-writable working directory;
- pass `SHINY_DESKTOP_APP_DIR` to R;
- clean up the R process when the Electron window closes.

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

Very old Electron versions may cause modern Shiny UI differences, especially with upload controls, Bootstrap components, and tables. If the desktop app behaves differently from Chrome or Edge, upgrade Electron first.

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

You may rename the release folder:

```text
MyShinyApp_1.0.0_win_x64
```

## 11. Send the Release Folder to Users

Send the whole release folder, or a zip made from the whole folder.

Do not send only:

```text
setup.exe
```

The executable depends on files beside it, especially:

```text
resources/app/R-Portable-Win
resources/app/app.R
resources/app/www
```

