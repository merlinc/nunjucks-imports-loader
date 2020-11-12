const loaderUtils = require('loader-utils')

const path = require('path')

function adjustPaths(content, map) {
  this.cacheable()

  const relativeImportRegExp = /({%- include ["'])(\.\/[A-Za-z\-]+.njk)+(['"] -%})/g
  const relativeImportPaths = relativeImportRegExp.exec(content)

  if (!relativeImportPaths) {
    return content
  }

  const options = loaderUtils.getOptions(this)

  let newSource = content

  let modulePath = path.dirname(this.resourcePath)
  let basePath

  for (searchPath of options.searchPaths.concat([]).sort()) {
    if (this.resourcePath.startsWith(searchPath)) {
      basePath = searchPath
    }
  }

  const replacer = function replacer(match, p1, p2, p3, offset, string) {
    return p1 + path.relative(basePath, path.resolve(modulePath, p2)) + p3
  }

  newSource = newSource.replace(relativeImportRegExp, replacer)

  this.callback(null, newSource, map)
}

module.exports = adjustPaths
