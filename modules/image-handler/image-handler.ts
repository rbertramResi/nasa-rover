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
  const response = await ky.get(photoData.img_src, {
    retry: 3,
    timeout: 5000
  });
  if (!response.ok) {
    console.error('failed to retrieve image');
    return;
  }
  const imageData = await response.arrayBuffer();
  downloadImage(imageData, photoData.earth_date, `${photoData.rover}-${photoData.id}`)
}

export async function findAndSaveImagesByDate(date: DateApiFormat): Promise<Result<null, FindAndSaveErrors | GetImagesError>> {
  const apiResult = await getImagesByDay(date);
  if (!apiResult.ok) {
    return apiResult;
  }
  const tasks = [];
  for (const photoData of apiResult.value.photos) {
    try {
      tasks.push(saveTask(photoData));
    } catch (error) {
      console.error('error fetching image:', error);
    }
  }
  const results = await Promise.allSettled(tasks);
  if (results.some(r => r.status === 'rejected')) {
    console.warn('some images failed to download');
  }
  return { ok: true, value: null };
}
