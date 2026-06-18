app_dir <- Sys.getenv("SHINY_DESKTOP_APP_DIR", unset = "")
if (!nzchar(app_dir) || !dir.exists(app_dir)) {
  app_dir <- getwd()
}
app_dir <- normalizePath(app_dir, winslash = "/", mustWork = FALSE)

resource_dir <- file.path(app_dir, "www")
if (dir.exists(resource_dir)) {
  shiny::addResourcePath("assets", resource_dir)
}

asset_src <- function(filename) {
  f <- file.path(resource_dir, filename)
  if (!file.exists(f)) return(NULL)
  paste0("assets/", filename)
}

# Example:
# logo_src <- asset_src("logo.png")
# tags$img(src = logo_src)

