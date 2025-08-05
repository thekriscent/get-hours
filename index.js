const express = require('express');
const cors = require('cors');
const { DateTime } = require('luxon');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const hours = {
  Sunday:    { open: '10:30 AM', close: '2:00 AM' },
  Monday:    { open: '10:30 AM', close: '2:00 AM' },
  Tuesday:   { open: '10:30 AM', close: '2:00 AM' },
  Wednesday: { open: '10:30 AM', close: '2:00 AM' },
  Thursday:  { open: '10:30 AM', close: '2:00 AM' },
  Friday:    { open: '10:30 AM', close: '4:00 AM' },
  Saturday:  { open: '10:30 AM', close: '4:00 AM' }
};

function getAdjustedDay(timezone = 'America/New_York') {
  let now = DateTime.now().setZone(timezone);
  const totalMinutes = now.hour * 60 + now.minute;

  if (totalMinutes < 240) {
    now = now.minus({ days: 1 });
  }

  return now.toFormat('cccc');
}

app.post('/get_hours', (req, res) => {
  try {
    const today = getAdjustedDay();
    const todayHours = hours[today];

    if (!todayHours) {
      return res.status(500).json({ result: "Sorry, I couldn't retrieve today's hours." });
    }

    const resultText = `Today, we're open from ${todayHours.open} until ${todayHours.close}.`;
    return res.status(200).json({ result: resultText });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ result: 'An error occurred retrieving our hours.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
