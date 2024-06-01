
const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
let numbersWindow = [];

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, { timeout: 500 });
    return response.data.numbers;
  } catch (error) {
    console.error('Error fetching numbers:', error);
    return [];
  }
};

const calculateAverage = (numbers) => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const windowPrevState = [...numbersWindow];
  const newNumbers = await fetchNumbers(numberid);
  const uniqueNewNumbers = [...new Set(newNumbers)];

  uniqueNewNumbers.forEach((number) => {
    if (!numbersWindow.includes(number)) {
      if (numbersWindow.length >= WINDOW_SIZE) {
        numbersWindow.shift();
      }
      numbersWindow.push(number);
    }
  });

  const windowCurrState = [...numbersWindow];
  const avg = calculateAverage(numbersWindow);

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg
  });
});

app.listen(port, () => {
  console.log(`Average Calculator Microservice is running on http://localhost:${port}`);
});
