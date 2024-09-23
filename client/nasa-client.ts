import { z } from 'zod';
import type { DateApiFormat } from '../modules/day/day';
import type { Result } from '../utils/types';
import axios, { isAxiosError } from 'axios';

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
  invalidSchema: 'invalidSchema',
  apiFailure: 'apiFailure',
  rateLimited: 'rateLimited',
} as const;

export type GetImagesError = typeof GET_IMAGES_ERROR[keyof typeof GET_IMAGES_ERROR];

export async function getImagesByDay(date: DateApiFormat): Promise<Result<PhotosResponse, GetImagesError>> {
  const key = Bun.env.NASA_API_KEY ?? 'DEMO_KEY'
  try {
    const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${date}&api_key=${key}`);
    const result = PhotosResponseSchema.safeParse(response.data);
    if (result.error) {
      console.error(`api error ${result.error.message}`);
      return { ok: false, value: GET_IMAGES_ERROR.invalidSchema };
    }
    return { ok: true, value: result.data };
  } catch (e) {
    if (isAxiosError(e)) {
      if (e.status) {
        console.error(`rate limit exceeded ${e}`);
        return { ok: false, value: GET_IMAGES_ERROR.rateLimited };
      }
    }
    console.error(`failed to get images: ${e}`);
    return { ok: false, value: GET_IMAGES_ERROR.apiFailure };
  }
}
