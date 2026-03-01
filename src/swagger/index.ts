/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export function loadSwaggerSpec() {
  const configPath = path.join(__dirname, '../../swagger.config.yml')
  const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as Record<
    string,
    any
  >

  const docsPath = path.join(__dirname, '../../docs')
  const authDoc = yaml.load(
    fs.readFileSync(path.join(docsPath, 'auth.doc.yml'), 'utf8'),
  ) as Record<string, any>
  const cardDoc = yaml.load(
    fs.readFileSync(path.join(docsPath, 'card.doc.yml'), 'utf8'),
  ) as Record<string, any>
  const deckDoc = yaml.load(
    fs.readFileSync(path.join(docsPath, 'deck.doc.yml'), 'utf8'),
  ) as Record<string, any>

  const allPaths = {
    ...authDoc.paths,
    ...cardDoc.paths,
    ...deckDoc.paths,
  }

  return {
    ...config,
    paths: allPaths,
  }
}
