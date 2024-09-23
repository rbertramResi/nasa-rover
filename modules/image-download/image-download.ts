import { mkdir } from "node:fs/promises";
import type { Result } from "../../utils/types";

// assumes mac or linux. whoops
const DOWNLOAD_LOCATION = '~/.local/state/rover'

// NOTE could improve by making resumable if something fails midway through the list
export async function downloadImage(imageBuffer: ArrayBuffer, earthDate: string, fileName: string): Promise<Result<null, null>> {
  const location = `${DOWNLOAD_LOCATION}/${earthDate}`;
  try {
    await mkdir(location, { recursive: true });
  } catch {
    // this could be better, but for now, assume already exists, no op 
  }

  try {
    await Bun.write(`${location}/${fileName}`, imageBuffer);
    return { ok: true, value: null }
  } catch (e) {
    console.error(`failed to save image ${e}`);
    return { ok: false, value: null }
  }
}
