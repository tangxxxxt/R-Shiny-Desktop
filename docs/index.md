# R Shiny Desktop Packaging Guide

This documentation contains two routes for packaging an R Shiny app as a Windows desktop app.

## Routes

- [Route A: Direct `app.R` workflow](guide.md)  
  For apps started directly from an `app.R` file, especially when some dependencies are not ordinary CRAN installs.

- [Route B: R package workflow](route-b-r-package.md)  
  For apps that are first converted into an R package, then launched from Electron through the installed package.

- [Troubleshooting](troubleshooting.md)

## Acknowledgement

This documentation was prepared after studying and updating the workflow from the Tencent Cloud article [Package R Shiny as a desktop application](https://cloud.tencent.com/developer/article/1957899). The original article introduced the core Electron plus portable R idea. This repository adds updated implementation details and separates the workflow into two reusable routes.

