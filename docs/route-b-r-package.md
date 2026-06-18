# Route B: R Package Workflow

This route first turns a Shiny app into an R package, then packages that R package as a desktop app with Electron.

Use this route when:

- the Shiny app can be organized as an R package;
- dependencies can be installed reproducibly, usually from CRAN;
- you want a cleaner project structure than a single large `app.R`;
- the final user should run a desktop app without installing R or R packages manually.

If your app depends on packages that require special repositories, GitHub-only installation, private repositories, or manual binary handling, use [Route A](guide.md) or add those special dependency steps explicitly.

This route follows common R package and golem-style Shiny app practices. It is also compatible with the Electron plus portable R idea described in the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899), but it does not copy that article's text or images.

All paths below are examples. Replace them with your own paths.

```text
C:\Projects\MyShinyPackageDesktop
C:\Projects\MyShinyPackageDesktop\myshinyapp
C:\Projects\MyShinyPackageDesktop\electron-app
```

## 1. Prepare Development Tools

Install these on the development computer:

- R x64;
- Rtools matching your R version, if packages need compilation;
- Node.js x64;
- Git, if you clone templates or install packages from GitHub during development.

Install useful R development packages:

```r
install.packages(c(
  "devtools",
  "roxygen2",
  "pkgload",
  "remotes",
  "golem"
), repos = "https://cloud.r-project.org")
```

## 2. Create an R Package for the Shiny App

Create a package project:

```r
golem::create_golem("C:/Projects/MyShinyPackageDesktop/myshinyapp")
```

Typical structure:

```text
myshinyapp/
  DESCRIPTION
  NAMESPACE
  R/
    app_ui.R
    app_server.R
    run_app.R
  inst/
    app/
      www/
```

You can also create the package manually, but `golem` gives a Shiny-friendly structure.

## 3. Move `app.R` Logic into the Package

A normal `app.R` often looks like this:

```r
library(shiny)

ui <- fluidPage(...)
server <- function(input, output, session) {
  ...
}

shinyApp(ui, server)
```

In the package workflow, split it into package functions:

```text
R/app_ui.R
R/app_server.R
R/run_app.R
```

Example `R/app_ui.R`:

```r
app_ui <- function(request) {
  shiny::fluidPage(
    shiny::titlePanel("My Shiny App"),
    shiny::uiOutput("main")
  )
}
```

Example `R/app_server.R`:

```r
app_server <- function(input, output, session) {
  output$main <- shiny::renderUI({
    shiny::tags$p("Hello from a packaged Shiny app.")
  })
}
```

Example `R/run_app.R`:

```r
#' Run the Shiny application
#'
#' @param port Port used by the Shiny server.
#' @param host Host used by the Shiny server.
#' @param launch.browser Whether to open an external browser.
#' @export
run_app <- function(port = 3838, host = "127.0.0.1", launch.browser = FALSE) {
  app <- shiny::shinyApp(ui = app_ui, server = app_server)
  shiny::runApp(app, port = port, host = host, launch.browser = launch.browser)
}
```

This exported `run_app()` function is what Electron will call later.

## 4. Move Static Files into `inst/app/www`

If your original Shiny app has:

```text
app.R
www/
  logo.png
  style.css
```

move the static files into:

```text
myshinyapp/inst/app/www/
```

Inside package code, locate files with `system.file()`:

```r
app_sys <- function(...) {
  system.file(..., package = "myshinyapp")
}

www_dir <- app_sys("app", "www")
if (dir.exists(www_dir)) {
  shiny::addResourcePath("www", www_dir)
}
```

Then refer to files as:

```r
shiny::tags$img(src = "www/logo.png")
```

Do not use absolute paths from your own computer.

## 5. Declare Dependencies in `DESCRIPTION`

Add every package used by the app to `Imports`.

Example:

```text
Imports:
    shiny,
    DT,
    dplyr,
    readxl,
    openxlsx,
    leaflet,
    sf
```

Use namespace-qualified calls in package code:

```r
DT::renderDT(...)
dplyr::mutate(...)
```

This makes dependencies clearer and helps R package checks catch missing imports.

## 6. Document, Check, and Test the Package

From the package directory:

```r
setwd("C:/Projects/MyShinyPackageDesktop/myshinyapp")
devtools::document()
devtools::load_all()
myshinyapp::run_app()
```

Then check:

```r
devtools::check()
```

Fix errors before packaging the desktop app. Warnings may also matter if they indicate missing files, undeclared packages, or non-portable paths.

## 7. Create the Electron Project

Create the Electron template:

```powershell
cd C:\Projects\MyShinyPackageDesktop
git clone https://github.com/electron/electron-quick-start.git electron-app
cd electron-app
```

Configure npm if needed:

```powershell
npm config set registry https://registry.npmmirror.com
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm config delete electron_custom_dir
```

Install local Electron dependencies:

```powershell
npm install electron@13.6.9 --save-dev
npm install electron-packager@15.2.0 --save-dev
```

## 8. Add R-Portable to the Electron Project

Copy a complete Windows x64 R installation into:

```text
electron-app/R-Portable-Win
```

Verify:

```powershell
cd C:\Projects\MyShinyPackageDesktop\electron-app
.\R-Portable-Win\bin\Rscript.exe -e "R.version.string"
```

## 9. Install the R Package into Bundled R

Install `remotes` into the bundled R:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "install.packages('remotes', repos='https://cloud.r-project.org')"
```

Install your Shiny package into bundled R:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "remotes::install_local('C:/Projects/MyShinyPackageDesktop/myshinyapp', dependencies=TRUE, upgrade='never')"
```

If all dependencies are available from CRAN, this step should install the package and its dependencies into `R-Portable-Win/library`.

Verify:

```powershell
.\R-Portable-Win\bin\Rscript.exe -e "library(myshinyapp); myshinyapp::run_app(port=9191, launch.browser=FALSE)"
```

Open:

```text
http://127.0.0.1:9191
```

If the package fails here, fix the R package or dependency installation before touching Electron.

## 10. Make Electron Launch the Installed R Package

In Route B, Electron does not need to run `app.R`. It should run the installed package:

```js
const rCode = [
  "library(myshinyapp)",
  `myshinyapp::run_app(port=${port}, launch.browser=FALSE)`
].join("; ")
```

The child process should still use bundled R:

```js
child.spawn(
  path.join(app.getAppPath(), "R-Portable-Win", "bin", "Rscript.exe"),
  ["-e", rCode],
  {
    cwd: app.getPath("documents"),
    env: Object.assign({}, process.env, {
      SHINY_DESKTOP_USER_DATA_DIR: app.getPath("userData")
    })
  }
)
```

You can adapt [templates/main.js](../templates/main.js), but replace the `shiny::runApp('app.R')` part with `library(myshinyapp); myshinyapp::run_app(...)`.

## 11. Configure `package.json`

Example:

```json
{
  "name": "my-shiny-package-desktop",
  "version": "1.0.0",
  "description": "My Shiny package desktop app",
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

## 12. Test and Package

Test Electron:

```powershell
cd C:\Projects\MyShinyPackageDesktop\electron-app
npm start
```

Package:

```powershell
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm run package-win
```

The output is usually:

```text
release/my-shiny-package-desktop-win32-x64
```

Send the whole release folder to users. Do not send only `setup.exe`, because it depends on files beside it, including the bundled R runtime and installed package library.

## Notes for This Route

- This route is usually cleaner than a large `app.R` when the app is maintained long term.
- It requires more R package discipline: `DESCRIPTION`, `NAMESPACE`, exported functions, and portable resource paths all matter.
- It works best when dependencies are CRAN packages.
- If a package must come from a special repository, GitHub, or local source, document that step clearly or use Route A.

