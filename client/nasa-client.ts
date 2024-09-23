import { z } from 'zod';
import ky from 'ky';

export const cameraShortSchema = z.object({
  name: z.string(),
  full_name: z.string(),
})
export const cameraSchema = cameraShortSchema.extend({
  id: z.number(),
  rover_id: z.number(),
})

export const roverSchema = z.object({
  id: z.number(),
  name: z.string(),
  landing_data: z.string(),
  launch_date: z.string(),
  status: z.string(),
  max_sol: z.number(),
  max_date: z.string(),
  total_photos: z.number(),
});

export const photoSchema = z.object({
  id: z.number(),
  sol: z.number(),
  img_src: z.string().url(),
  camera: cameraSchema,
  earth_data: z.string(),
  rover: roverSchema,
  cameras: z.array(cameraShortSchema),
})


export const photosResponseSchema = z.object({
  photos: z.array(photoSchema),
});

type PhotosResponse = z.infer<typeof photosResponseSchema>;


// TODO fix date type
export function getImagesByDay(data: `${string}-${string}-${string}}`): Promise<PhotosResponse> {
  ky.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2024-01-01&api_key=DEMO_KEY`)
}
