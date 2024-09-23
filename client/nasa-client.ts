import { z } from 'zod';
import ky from 'ky';
import type { DateApiFormat } from '../modules/day/day';
import type { Result } from '../utils/types';

export const CameraShortSchema = z.object({
  name: z.string().optional(),
  full_name: z.string().optional(),
})
export const CameraSchema = CameraShortSchema.extend({
  id: z.number(),
  rover_id: z.number(),
})

export const RoverSchema = z.object({
  id: z.number(),
  name: z.string(),
  landing_data: z.string().optional(),
  launch_date: z.string().optional(),
  status: z.string(),
  max_sol: z.number(),
  max_date: z.string(),
  total_photos: z.number(),
});

export const PhotoSchema = z.object({
  id: z.number(),
  sol: z.number(),
  img_src: z.string().url(),
  camera: CameraSchema.optional(),
  earth_date: z.string(),
  rover: RoverSchema.optional(),
  cameras: z.array(CameraShortSchema).optional(),
})


export const PhotosResponseSchema = z.object({
  photos: z.array(PhotoSchema),
});

export type Photo = z.infer<typeof PhotoSchema>;
type PhotosResponse = z.infer<typeof PhotosResponseSchema>;



export const GET_IMAGES_ERROR = {
  invalidResponse: 'invalidResponse',
  apiFailure: 'apiFailure',
} as const;

export type GetImagesError = typeof GET_IMAGES_ERROR[keyof typeof GET_IMAGES_ERROR];

export async function getImagesByDay(date: DateApiFormat): Promise<Result<PhotosResponse, GetImagesError>> {
  try {
    const response = await ky.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${date}&api_key=DEMO_KEY`, {
      // this can take a while
      timeout: 15_000,
    }).json();
    const result = PhotosResponseSchema.safeParse(response);
    if (result.error) {
      console.error(`api error ${result.error.message}`);
      return { ok: false, value: GET_IMAGES_ERROR.invalidResponse };
    }
    return { ok: true, value: result.data };
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'status' in e) {
      console.log(e.status);
    }
    console.error(`failed to get images: ${e}`);
    return { ok: false, value: GET_IMAGES_ERROR.apiFailure };
  }
}
