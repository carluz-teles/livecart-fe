export function isStaleDeploymentError(error: Pick<Error, "name" | "message">) {
  return (
    error.name === "ChunkLoadError" ||
    /Failed to find Server Action|Server Action .+ was not found|Failed to load chunk|Loading chunk .+ failed|deployment mismatch/i.test(
      error.message
    )
  )
}
