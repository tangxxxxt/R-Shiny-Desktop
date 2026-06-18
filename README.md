# R Shiny Desktop Packaging Guide

This repository explains two practical workflows for packaging an R Shiny application as a Windows desktop program with Electron.

The two workflows are intentionally separated:

- **Route A: Direct `app.R` workflow**  
  Use this when you already have a Shiny app entry file such as `app.R`, and at least one dependency cannot be installed from CRAN in a normal way. Examples include packages installed from a special repository, GitHub, or local source.

- **Route B: R package workflow**  
  Use this when your Shiny app can first be converted into an R package, and its dependencies can be installed in a reproducible way, usually from CRAN. This route is cleaner for long-term maintenance.

In both routes, the final desktop app should bundle its own R runtime. Users should not need to install R, RStudio, or R packages manually.

> All paths in this repository are examples, such as `C:\Projects\MyShinyDesktop`. Replace them with your own project paths.

## Source and Acknowledgement

This guide is not an entirely original workflow. It was written after studying and practicing the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899).

The original article provided the basic idea of using Electron, `electron-quick-start`, `electron-packager`, and a portable R runtime to package a Shiny app. This repository reorganizes that idea into two routes and updates details that are easy to break in newer environments, including npm mirror settings, Electron download paths, newer Electron versions, bundled R dependencies, static `www/` resources, and release testing.

Please credit the original article when reusing this tutorial, and do not copy the original article's text or images without permission.

## Start Here

- [Route A: Direct `app.R` workflow](docs/guide.md)
- [Route B: R package workflow](docs/route-b-r-package.md)
- [Troubleshooting](docs/troubleshooting.md)

## Helper Files

- [scripts/install-r-deps.R](scripts/install-r-deps.R): example dependency installer for bundled R.
- [scripts/verify-portable-r.R](scripts/verify-portable-r.R): basic bundled R verification.
- [scripts/package-win.ps1](scripts/package-win.ps1): example Windows packaging command.
- [templates/main.js](templates/main.js): Electron launcher template for Route A.
- [templates/app-resource-path.R](templates/app-resource-path.R): example resource-path helper for `www/` assets.

