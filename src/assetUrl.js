// Resolve public images against the deployment folder, including GitHub Pages repos.
export function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
