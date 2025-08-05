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

function getAdjustedDay(now) {
  const totalMinutes = now.hour * 60 + now.minute;
  if (totalMinutes < 240) {
    now = now.minus({ days: 1 });
  }
  return now.toFormat('cccc');
}

function parseTimeToDateTime(timeStr, now) {
  const [rawHour, modifier] = timeStr.split(' ');
  const [hour, minute] = rawHour.split(':').map(Number);
  let dt = now.set({ hour, minute, second: 0 });
  if (modifier === 'PM' && hour !== 12) dt = dt.plus({ hours: 12 });
  if (modifier === 'AM' && hour === 12) dt = dt.minus({ hours: 12 });
  return dt;
}

app.post('/get_hours', (req, res) => {
  try {
    const timezone = 'America/New_York'; // Tampa only for now
    let now = DateTime.now().setZone(timezone);
    const today = getAdjustedDay(now);
    const todayHours = hours[today];

    if (!todayHours) {
      return res.status(500).send("Sorry, I couldn't retrieve today's hours.");
    }

    let openTime = parseTimeToDateTime(todayHours.open, now);
    let closeTime = parseTimeToDateTime(todayHours.close, now);

    // Handle after-midnight closing
    if (closeTime < openTime) {
      closeTime = closeTime.plus({ days: 1 });
    }

    const isOpen = now >= openTime && now < closeTime;

    let statusLine = isOpen
      ? "Yes, we're currently open."
      : "It looks like we're currently closed — but I'd be happy to help you schedule an order or answer any other questions.";

    const resultText = `Today, we're open from ${todayHours.open} until ${todayHours.close}. ${statusLine}`;

    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(resultText);
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).send("Something went wrong retrieving today's hours.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
