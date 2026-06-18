# Troubleshooting

## npm Cannot Access `registry.npm.taobao.org`

Old tutorials often use:

```powershell
npm config set registry http://registry.npm.taobao.org/
```

This address is obsolete. Use:

```powershell
npm config set registry https://registry.npmmirror.com
```

## Electron Download Returns 404

Example:

```text
Response code 404 for https://npmmirror.com/mirrors/electron/v5.0.13/...
```

Common causes:

- The configured `electron_custom_dir` is wrong.
- A previous npm config forces an old Electron directory.
- The mirror has the file under `5.0.13`, not `v5.0.13`, or vice versa depending on tool version.

Check:

```powershell
npm config get electron_custom_dir
npm config delete electron_custom_dir
```

Then install with explicit environment variables:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_CUSTOM_DIR="13.6.9"
npm install electron@13.6.9 --save-dev
```

## Desktop App Opens but Shows a Blank Page

Usually the Electron window opened, but the Shiny backend did not start.

Test R directly:

```powershell
cd C:\Projects\MyShinyDesktop\electron-app
$env:SHINY_DESKTOP_APP_DIR=(Get-Location).Path
.\R-Portable-Win\bin\Rscript.exe -e "shiny::runApp('app.R', port=9191, launch.browser=FALSE)"
```

Then open:

```text
http://127.0.0.1:9191
```

The console will show the real R error.

## Images Are Missing

Put images under:

```text
electron-app/www
```

After packaging, confirm:

```text
release/my-shiny-app-win32-x64/resources/app/www
```

Do not reference your own local folder in `app.R`.

Bad:

```r
tags$img(src = "D:/my/local/image.png")
```

Good:

```r
tags$img(src = "logo.png")
```

or use `addResourcePath()` with the app directory.

## CSV Upload Has No Visible Response

Check these items:

- The desktop app uses a modern Electron version.
- `app.R` and the packaged `resources/app/app.R` are the same.
- The bundled R has the same key package versions as development R.
- The Shiny app displays errors after upload.
- The app uses a user-writable temp directory.

Useful package version check:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "pkgs <- c('shiny','bs4Dash','DT','httpuv','htmltools'); for (p in pkgs) cat(p, as.character(packageVersion(p)), '\n')"
```

## File Dialog Opens in the R Folder

This usually means the R process working directory is inside the app bundle or the bundled R folder.

In Electron, start R with:

```js
cwd: app.getPath("documents")
```

and pass the true app folder through an environment variable:

```js
env: Object.assign({}, process.env, {
  SHINY_DESKTOP_APP_DIR: app.getAppPath()
})
```

## RStudio Can Run the App but Desktop App Cannot

Development R and bundled R are different environments.

Check:

```powershell
"C:\Program Files\R\R-x.y.z\bin\Rscript.exe" -e "sessionInfo()"
.\R-Portable-Win\bin\Rscript.exe -e "sessionInfo()"
```

Install missing packages into `R-Portable-Win`, not only into system R.

## INLA Fails to Install

Use the INLA repository:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('INLA', repos=c(INLA='https://inla.r-inla-download.org/R/stable', CRAN='https://cloud.r-project.org'), dependencies=TRUE)"
```

If a dependency fails because it needs compilation, install a compatible Rtools version or use binary packages when possible.

## GitHub Package Fails to Install

Install `remotes` first:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('remotes', repos='https://cloud.r-project.org')"
```

Public repo:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-package>', dependencies=TRUE, upgrade='never')"
```

Private repo:

```powershell
$env:GITHUB_PAT="your_token_here"
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_github('<your-github>/<your-private-package>', dependencies=TRUE, upgrade='never')"
```

## Old App Processes Cause Confusing Behavior

Close all previous app windows before testing a new build.

On Windows:

```powershell
Get-Process | Where-Object { $_.ProcessName -match 'setup|electron|Rscript' }
```

If necessary:

```powershell
Stop-Process -Name setup -Force
```

Use random ports in Electron to reduce collisions.

