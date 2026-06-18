# R Shiny Desktop Packaging Guide

This documentation contains two routes for packaging an R Shiny app as a Windows desktop app.

## Routes

- [Route B: R package workflow](route-b-r-package.md)  
  The conventional route. The Shiny app is converted into an R package, dependencies are declared in `DESCRIPTION`, and Electron launches the installed package.

- [Route A: Direct `app.R` workflow](guide.md)  
  The workaround route. Use it when dependencies cannot all be handled as ordinary CRAN package installs and must be preinstalled into bundled R from special sources.

- [Troubleshooting](troubleshooting.md)

## Acknowledgement

This documentation was prepared after studying and updating multiple public resources. Route A is mainly inspired by the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899). Route B follows common R package and golem-style Shiny development practices from resources such as the [golem documentation](https://thinkr-open.github.io/golem/), [Engineering Production-Grade Shiny Apps](https://engineering-shiny.org/golem.html), and [R Packages](https://r-pkgs.org/whole-game.html).
