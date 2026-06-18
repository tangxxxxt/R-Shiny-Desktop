# R Shiny Desktop Packaging Guide

This repository explains two practical workflows for packaging an R Shiny application as a Windows desktop program with Electron.

The two workflows are intentionally separated:

- **Route B: R package workflow**  
  This is the more conventional development route. The Shiny app is first organized as an R package, dependencies are declared in `DESCRIPTION`, static files are stored under `inst/`, and the desktop app launches the installed package. Use this when dependencies can be installed reproducibly, usually from CRAN.

- **Route A: Direct `app.R` workflow**  
  This is the workaround route for apps whose dependencies cannot all be installed through the ordinary CRAN-based package workflow. Use it when you need to preinstall packages from special repositories, GitHub, private repositories, or local source into the bundled R runtime.

In both routes, the final desktop app should bundle its own R runtime. Users should not need to install R, RStudio, or R packages manually.

> All paths in this repository are examples, such as `C:\Projects\MyShinyDesktop`. Replace them with your own project paths.

## Source and Acknowledgement

This guide is not an entirely original workflow. It was written after studying and practicing several public resources.

For Route A, the main inspiration is the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899). That article provided the basic idea of using Electron, `electron-quick-start`, `electron-packager`, and a portable R runtime to package a Shiny app. This repository updates that route for newer npm mirrors, Electron download paths, modern Electron versions, bundled R dependencies, static `www/` resources, and release testing.

For Route B, the R package structure follows common Shiny package practices from resources such as the [golem documentation](https://thinkr-open.github.io/golem/), [Engineering Production-Grade Shiny Apps](https://engineering-shiny.org/golem.html), and [R Packages](https://r-pkgs.org/whole-game.html). The Electron packaging part still uses the Electron runtime and packager workflow.

Please credit the original resources when reusing this tutorial, and do not copy their text or images without permission.

## Start Here

- If your dependencies are ordinary CRAN packages, start with [Route B: R package workflow](docs/route-b-r-package.md).
- If your dependencies require special repositories, GitHub, private repositories, or local source installation, start with [Route A: Direct `app.R` workflow](docs/guide.md).
- [Troubleshooting](docs/troubleshooting.md)

## Helper Files

- [scripts/install-r-deps.R](scripts/install-r-deps.R): example dependency installer for bundled R.
- [scripts/verify-portable-r.R](scripts/verify-portable-r.R): basic bundled R verification.
- [scripts/package-win.ps1](scripts/package-win.ps1): example Windows packaging command.
- [templates/main.js](templates/main.js): Electron launcher template for Route A.
- [templates/main-package.js](templates/main-package.js): Electron launcher template for Route B.
- [templates/app-resource-path.R](templates/app-resource-path.R): example resource-path helper for `www/` assets.
