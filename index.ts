import server from 'bunrest';
import { DateInputSchema, toApiSchema } from './modules/day/day';
import { findAndSaveImagesByDate } from './modules/image-handler/image-handler';
const app = server();

// Query at '/api/v1/images/{DATE}. Example date formats are 02/27/17 June 2, 2018 Jul-13-2016 

app.get('/api/v1/images', async (req, res) => {
  const dateParam = req.query?.date ?? '';
  const validationResult = toApiSchema(dateParam);
  if (!validationResult.ok) {
    res.status(400).send('Invalid date')
    return;
  }
  await findAndSaveImagesByDate(validationResult.value);
  res.status(200).json({ message: req.params?.id });
});

app.listen(5555, () =>
  console.log(`Listening on port 5555!`),
);
