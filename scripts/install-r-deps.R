cran <- "https://cloud.r-project.org"

install_if_missing <- function(pkgs, repos = cran) {
  missing <- pkgs[!vapply(pkgs, requireNamespace, logical(1), quietly = TRUE)]
  if (length(missing) > 0) {
    install.packages(missing, repos = repos, dependencies = TRUE)
  }
}

# Replace this list with the packages actually used by your app.
cran_packages <- c(
  "shiny",
  "DT",
  "htmltools",
  "httpuv",
  "remotes"
)

install_if_missing(cran_packages)

# Optional example: install INLA only if your app really uses it.
# install.packages(
#   "INLA",
#   repos = c(
#     INLA = "https://inla.r-inla-download.org/R/stable",
#     CRAN = cran
#   ),
#   dependencies = TRUE
# )

# Optional example: public GitHub package.
# remotes::install_github("<your-github>/<your-package>", dependencies = TRUE, upgrade = "never")

# Optional example: private GitHub package.
# Sys.setenv(GITHUB_PAT = "your_token_here")
# remotes::install_github("<your-github>/<your-private-package>", dependencies = TRUE, upgrade = "never")

# Optional example: local package.
# remotes::install_local("C:/Projects/MyShinyDesktop/source-package", dependencies = TRUE, upgrade = "never")

cat("Dependency installation finished.\n")

