import server from 'bunrest';
import { toApiSchema } from './modules/day/day';
import { FIND_AND_SAVE_ERRORS, findAndSaveImagesByDate } from './modules/image-handler/image-handler';
import { match } from 'ts-pattern';
import { GET_IMAGES_ERROR } from './client/nasa-client';
const app = server();

const PORT = 8080;
app.post('/api/v1/images', async (req, res) => {
  const dateParam = req.query?.date ?? '';
  const validationResult = toApiSchema(dateParam);
  if (!validationResult.ok) {
    res.status(400).send({ message: 'Invalid date' })
    return;
  }
  const result = await findAndSaveImagesByDate(validationResult.value);
  if (result.ok) {
    res.status(200).send({ message: 'Images downloaded' });
    return;
  }
  match(result.value)
    .with(FIND_AND_SAVE_ERRORS.partialDownloadError, () => {
      res.status(206).json({ message: 'Some downloads failed' });
    })
    .with(GET_IMAGES_ERROR.invalidSchema, () => {
      res.status(422).json({ message: 'Unexpected response schema' });
    })
    .with(GET_IMAGES_ERROR.rateLimited, () => {
      res.status(429).json({ message: 'API token rate limited' });
    })
    .with(FIND_AND_SAVE_ERRORS.downloadError, () => {
      res.status(500).json({ message: 'Unable to download images' });
    })
    .with(GET_IMAGES_ERROR.apiFailure, () => {
      res.status(502).json({ message: 'Unable to request images list from api' });
    })
    .exhaustive();
});

app.listen(PORT, () =>
  console.log(`Listening on port ${PORT}`),
);
