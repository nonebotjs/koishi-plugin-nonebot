import axios from 'axios'
import execa from 'execa'
import type { PathLike } from 'node:fs'
import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import { join } from 'node:path'
import stream from 'node:stream'
import { promisify } from 'node:util'
import { extract } from 'tar'

export const spawnOutput = async (
  command: string,
  args?: ReadonlyArray<string>,
  options?: execa.SyncOptions
): Promise<string> => {
  const parsedOptions: execa.SyncOptions = Object.assign<
    execa.SyncOptions,
    execa.SyncOptions,
    execa.SyncOptions | undefined
  >({}, { stderr: 'inherit', stdout: 'pipe', shell: false }, options)
  const child = execa(command, args, parsedOptions)
  let stdout = ''
  child.stdout.on('data', (x) => (stdout += x))
  return new Promise<string>((resolve, reject) => {
    child.on('close', (x) => {
      if (x) reject(x)
      else resolve(stdout)
    })
  })
}

export async function download(src: string, dest: string, filename: string) {
  const { data } = await axios.get<stream.Readable>(src, {
    responseType: 'stream',
  })
  const writable = filename.endsWith('.tar.gz')
    ? extract({ cwd: dest, newer: true })
    : createWriteStream(join(dest, filename))
  await promisify(stream.finished)(data.pipe(writable))
}

export async function exists(path: PathLike): Promise<boolean> {
  try {
    await fs.stat(path)
  } catch (_) {
    return false
  }
  return true
}
