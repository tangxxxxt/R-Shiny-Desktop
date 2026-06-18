# Package an R Shiny App as a Windows Desktop App

This repository is a practical guide for packaging an R Shiny application as a Windows desktop program with Electron, a bundled R runtime, and bundled R packages.

It is written for a common real-world case:

- Some dependencies are not available from CRAN.
- Some dependencies must be installed from special repositories, for example `INLA`.
- Some project packages must be installed from GitHub or from local source.
- The final user should run a desktop app without installing R, RStudio, or R packages manually.

> This guide uses example paths such as `C:\Projects\MyShinyDesktop`. Replace them with your own paths.

## Source and Acknowledgement

This guide is not an entirely original workflow. It was written after studying and practicing the Tencent Cloud article [R Shiny 打包成桌面应用程序](https://cloud.tencent.com/developer/article/1957899).

The original article provided the basic idea of using Electron, `electron-packager`, and a portable R runtime to package a Shiny app. This repository updates and reorganizes that workflow for a newer environment, especially:

- replacing obsolete npm mirror settings;
- avoiding old Electron download paths that now return 404;
- using a newer Electron runtime for better Shiny UI compatibility;
- handling dependencies that are not available directly from CRAN;
- documenting GitHub package, INLA, `www/` resources, random ports, and user-side troubleshooting.

Please credit the original article when reusing this tutorial.

## What You Will Build

The final Windows release folder will look like this:

```text
MyShinyApp_1.0.0_win_x64/
  setup.exe
  resources/
    app/
      app.R
      main.js
      package.json
      www/
      R-Portable-Win/
        bin/Rscript.exe
        library/
```

Users should receive the whole folder, or a zip made from the whole folder. They should not run `setup.exe` outside that folder.

## Quick Start

Read the full guide:

[docs/guide.md](docs/guide.md)

Useful helper scripts:

- [scripts/install-r-deps.R](scripts/install-r-deps.R)
- [scripts/verify-portable-r.R](scripts/verify-portable-r.R)
- [scripts/package-win.ps1](scripts/package-win.ps1)

Troubleshooting notes:

[docs/troubleshooting.md](docs/troubleshooting.md)

## Main Advantages Over a `.bat` Launcher

Compared with a `.bat` launcher, this desktop packaging approach has several advantages:

- The user does not need to see or operate a command-line window.
- The bundled app can include its own R runtime.
- Required R packages can be installed into the bundled R library.
- Static resources such as `www/` images, CSS, and JavaScript are shipped with the app.
- Startup logic, working directory, and temporary directories can be controlled by Electron.
- The app can avoid depending on the user's system-level R installation.

## Recommended Versions

The exact versions can vary, but this guide assumes:

```text
Windows x64
Node.js 12 or newer
Electron 13.6.9 or newer
electron-packager 15.2.0
R x64 bundled inside the app
```

Avoid very old Electron versions if your Shiny UI uses modern `shiny`, `bs4Dash`, `bslib`, `DT`, or complex file upload controls. Old Chromium engines can cause UI rendering and upload behavior differences.

## License

You may adapt this guide for your own project.
