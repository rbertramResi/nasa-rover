import { mkdir } from "node:fs/promises";

const DOWNLOAD_LOCATION = './rover'

// NOTE could improve by making resumable if something fails midway through the list
// no try/catch in function; failures handled in allSettled
export async function downloadImage(imageBuffer: ArrayBuffer, earthDate: string, fileName: string): Promise<void> {
  console.log('downloading...')
  const location = `${DOWNLOAD_LOCATION}/${earthDate}`;
  await mkdir(location, { recursive: true });// does not throw for existing path when recursive is true
  await Bun.write(`${location}/${fileName}.jpeg`, imageBuffer);
  console.log('download finished')
}
