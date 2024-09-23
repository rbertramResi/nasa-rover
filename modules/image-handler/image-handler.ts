import ky from 'ky';
import { getImagesByDay, type GetImagesError, type Photo } from "../../client/nasa-client";
import type { Result } from "../../utils/types";
import type { DateApiFormat } from "../day/day";
import { downloadImage } from '../image-download/image-download';

export const FIND_AND_SAVE_ERRORS = {
  downloadError: 'downloadError',
} as const;

export type FindAndSaveErrors = typeof FIND_AND_SAVE_ERRORS[keyof typeof FIND_AND_SAVE_ERRORS];

async function saveTask(photoData: Photo) {
  // NOTE: location redirect hangs, manually replace old domain with new
  const response = await ky.get(photoData.img_src.replace('mars.jpl.nasa.gov', 'mars.nasa.gov'), {
    retry: 2,
    timeout: 2_000,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36",
    }
  });
  if (!response.ok) {
    console.error('failed to retrieve image');
    return;
  }
  try {
    const imageData = await response.arrayBuffer();
    await downloadImage(imageData, photoData.earth_date, `${photoData.rover?.name ?? 'unknown_rover'}-${photoData.id}`)
  } catch (e) {
    console.error('download or buffer fail', e)
  }
}

export async function findAndSaveImagesByDate(date: DateApiFormat): Promise<Result<null, FindAndSaveErrors | GetImagesError>> {
  console.log('calling for image list')
  const apiResult = await getImagesByDay(date);
  if (!apiResult.ok) {
    return apiResult;
  }
  const tasks = [];

  console.log('starting iteration on ' + apiResult.value.photos.length);
  for (const photoData of apiResult.value.photos) {
    try {
      // await saveTask(photoData);
      tasks.push(saveTask(photoData));
    } catch (error) {
      console.error('error fetching image:', error);
    }
  }
  const results = await Promise.allSettled(tasks);
  if (results.every(r => r.status === 'rejected')) {
    console.error('all images failed to download');
  } else if (results.some(r => r.status === 'rejected')) {
    console.warn('some images failed to download');
  }
  return { ok: true, value: null };
}
