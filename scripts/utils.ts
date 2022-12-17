import axios from 'axios'
import execa from 'execa'
import { createWriteStream } from 'node:fs'
import { join } from 'node:path'
import stream from 'node:stream'
import { promisify } from 'node:util'

export const spawnOutput = async (
  command: string,
  args?: ReadonlyArray<string>,
  options?: execa.SyncOptions
): Promise<string> => {
  const parsedOptions: execa.SyncOptions = Object.assign<
    execa.SyncOptions,
    execa.SyncOptions,
    execa.SyncOptions | undefined
  >({}, { stderr: 'ignore', stdout: 'pipe', shell: false }, options)
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
  const res = await axios.get(src, {
    responseType: 'stream',
  })
  const writeStream = createWriteStream(join(dest, filename))
  await promisify(stream.finished)(
    (res.data as stream.Readable).pipe(writeStream)
  )
}
