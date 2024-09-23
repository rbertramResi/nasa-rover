import { getImagesByDay, type GetImagesError, type Photo } from "../../client/nasa-client";
import type { Result } from "../../utils/types";
import type { DateApiFormat } from "../day/day";
import { downloadImage } from '../image-download/image-download';
import axios from 'axios';

export const FIND_AND_SAVE_ERRORS = {
  downloadError: 'downloadError',
  partialDownloadError: 'partialDownloadError',
} as const;

export type FindAndSaveErrors = typeof FIND_AND_SAVE_ERRORS[keyof typeof FIND_AND_SAVE_ERRORS];

// no try/catch in function; failures handled in allSettled
async function saveTask(photoData: Photo) {
  // NOTE: location redirect hangs, manually replace old domain with new
  const response = await axios.get(photoData.img_src.replace('mars.jpl.nasa.gov', 'mars.nasa.gov'), {
    timeout: 2_000,
    responseType: 'arraybuffer',
  });
  await downloadImage(response.data, photoData.earth_date, `${photoData.rover?.name ?? 'unknown_rover'}-${photoData.id}`);
}

export async function findAndSaveImagesByDate(date: DateApiFormat): Promise<Result<null, FindAndSaveErrors | GetImagesError>> {
  console.log('calling for image list')
  const apiResult = await getImagesByDay(date);
  if (!apiResult.ok) {
    return apiResult;
  }
  const tasks = apiResult.value.photos.map(saveTask);
  const results = await Promise.allSettled(tasks);

  if (results.every(logIfRejected)) {
    console.error('all images failed to download');
    return { ok: false, value: FIND_AND_SAVE_ERRORS.downloadError };
  }
  if (results.some(logIfRejected)) {
    console.warn('some images failed to download');
    return { ok: false, value: FIND_AND_SAVE_ERRORS.partialDownloadError };
  }
  return { ok: true, value: null };
}

function logIfRejected<T>(settled: PromiseSettledResult<T>): boolean {
  if (settled.status === 'rejected') {
    console.error(settled.reason);
    return true;
  }
  return false;
}
