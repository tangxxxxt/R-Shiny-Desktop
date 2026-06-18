cran <- "https://cloud.r-project.org"

install_if_missing <- function(pkgs, repos = cran) {
  missing <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  if (length(missing) > 0) {
    install.packages(missing, repos = repos, dependencies = TRUE)
  }
}

cran_packages <- c(
  "shiny",
  "bs4Dash",
  "DT",
  "dplyr",
  "htmltools",
  "bslib",
  "fontawesome",
  "httpuv",
  "remotes"
)

install_if_missing(cran_packages)

if (!requireNamespace("INLA", quietly = TRUE)) {
  install.packages(
    "INLA",
    repos = c(
      INLA = "https://inla.r-inla-download.org/R/stable",
      CRAN = cran
    ),
    dependencies = TRUE
  )
}

# Public GitHub package example:
# remotes::install_github("<your-github>/<your-package>", dependencies = TRUE, upgrade = "never")

# Private GitHub package example:
# Sys.setenv(GITHUB_PAT = "your_token_here")
# remotes::install_github("<your-github>/<your-private-package>", dependencies = TRUE, upgrade = "never")

# Local package example:
# remotes::install_local("C:/Projects/MyShinyDesktop/source-package", dependencies = TRUE, upgrade = "never")

cat("Dependency installation finished.\n")

