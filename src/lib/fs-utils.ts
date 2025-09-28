import { promises as fs } from 'fs'
import path from 'path'

export const projectRoot = process.cwd()

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true })
}

export async function readJsonFile<T>(relativePath: string, defaultValue: T): Promise<T> {
  const absolutePath = path.join(projectRoot, relativePath)

  try {
    const data = await fs.readFile(absolutePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      await ensureDir(path.dirname(absolutePath))
      await fs.writeFile(absolutePath, JSON.stringify(defaultValue, null, 2), 'utf-8')
      return defaultValue
    }

    throw error
  }
}

export async function writeJsonFile<T>(relativePath: string, data: T) {
  const absolutePath = path.join(projectRoot, relativePath)
  await ensureDir(path.dirname(absolutePath))
  await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function resolvePublicPath(relativePath: string) {
  return path.join(projectRoot, 'public', relativePath)
}

export function toPublicUrl(relativePath: string) {
  if (!relativePath.startsWith('/')) {
    return `/${relativePath}`
  }

  return relativePath
}
