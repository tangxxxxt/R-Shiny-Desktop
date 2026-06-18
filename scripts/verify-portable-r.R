cat("R version:\n")
cat(R.version.string, "\n\n")

cat("R home:\n")
cat(R.home(), "\n\n")

cat("Library paths:\n")
print(.libPaths())

required <- c(
  "shiny",
  "bs4Dash",
  "DT",
  "htmltools",
  "httpuv",
  "INLA"
)

cat("\nPackage check:\n")
for (pkg in required) {
  ok <- requireNamespace(pkg, quietly = TRUE)
  version <- if (ok) as.character(utils::packageVersion(pkg)) else "missing"
  cat(sprintf("%-12s %s\n", pkg, version))
}

missing <- required[!vapply(required, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing) > 0) {
  stop("Missing packages: ", paste(missing, collapse = ", "), call. = FALSE)
}

cat("\nPortable R verification passed.\n")

