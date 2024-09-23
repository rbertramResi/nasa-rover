import { mkdir } from "node:fs/promises";
import type { Result } from "../../utils/types";

const DOWNLOAD_LOCATION = './rover'

// NOTE could improve by making resumable if something fails midway through the list
export async function downloadImage(imageBuffer: ArrayBuffer, earthDate: string, fileName: string): Promise<Result<null, null>> {
  console.log('ready to downloading')
  const location = `${DOWNLOAD_LOCATION}/${earthDate}`;
  try {
    await mkdir(location, { recursive: true });
  } catch (e) {
    console.error('failed to create dir', e)
    // this could be better, but for now, assume already exists, no op 
  }

  console.log('about to downloading')
  try {
    await Bun.write(`${location}/${fileName}.jpeg`, imageBuffer);
    return { ok: true, value: null }
  } catch (e) {
    console.error(`failed to save image ${e}`);
    return { ok: false, value: null }
  }
}
