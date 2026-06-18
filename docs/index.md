# R Shiny Desktop Packaging Guide

This documentation explains how to package an R Shiny app as a Windows desktop app when some dependencies cannot be installed directly from CRAN.

This guide was prepared after studying and updating the workflow from the Tencent Cloud article [R Shiny 打包成桌面应用程序](https://cloud.tencent.com/developer/article/1957899).

Start here:

- [Full guide](guide.md)
- [Troubleshooting](troubleshooting.md)

Script templates:

- [`install-r-deps.R`](../scripts/install-r-deps.R)
- [`verify-portable-r.R`](../scripts/verify-portable-r.R)
- [`package-win.ps1`](../scripts/package-win.ps1)

Code templates:

- [`main.js`](../templates/main.js)
- [`app-resource-path.R`](../templates/app-resource-path.R)
