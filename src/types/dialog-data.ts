import { TimeSeries, TimeSeriesPoint, Timestamp } from './series';

export class DialogData {
  constructor(
    duration: number,
    generalMetrics: {
      volume: TimeSeries;
    },
    utterances: DialogUtterance[],
  ) {
    this.duration = duration;
    this.generalMetrics = generalMetrics;
    this.utterances = utterances;
  }
  duration: number;
  generalMetrics: {
    volume: TimeSeries;
  };

  utterances: DialogUtterance[];

  makeSegments() {
    return this.utterances.map((utterance) => {
      return {
        start: utterance.startTime,
        end: utterance.endTime,
        color: utterance.speakerIdx === 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 255, 0.5)',
      };
    });
  }
}

export class DialogUtterance {
  constructor(
    text: string,
    startTime: Timestamp,
    endTime: Timestamp,
    metrics: {
      valence: TimeSeries;
    },
    speakerIdx: number,
  ) {
    this.text = text;
    this.startTime = startTime;
    this.endTime = endTime;
    this.metrics = metrics;
    this.speakerIdx = speakerIdx;
  }
  text: string;
  startTime: Timestamp;
  endTime: Timestamp;
  metrics: {
    valence: TimeSeries;
  };
  speakerIdx: number;
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generate_fake_dialog(): DialogData {
  const randomDuration = randBetween(60, 120);

  const utterances: DialogUtterance[] = [];
  let lastUtteranceEndTime = 0;

  for (let i = 0; i < randBetween(2, 7); i++) {
    const utteranceStartTime = lastUtteranceEndTime + randBetween(2, 10);
    const utteranceEndTime = utteranceStartTime + randBetween(5, 15);
    lastUtteranceEndTime = utteranceEndTime;

    utterances.push({
      text: `Utterance ${i}`,
      startTime: utteranceStartTime,
      endTime: utteranceEndTime,
      metrics: {
        valence: generate_fake_time_series(
          'valence for utterance' + i,
          utteranceEndTime - utteranceStartTime,
          utteranceStartTime,
        ),
      },
      speakerIdx: i % 2,
    });
  }

  return new DialogData(
    randomDuration,
    {
      volume: generate_fake_time_series('volume', randomDuration, 0),
    },
    utterances,
  );
}

function generate_fake_time_series(name: string, duration: number, start: number): TimeSeries {
  const frequency = 0.01;

  const points: TimeSeriesPoint[] = [];
  let currentValue = 0;

  for (let position = start; position < start + duration; position += frequency) {
    currentValue += randBetween(-10, 10) * 0.1;
    points.push({
      time: position,
      value: currentValue,
    });
  }

  return new TimeSeries(name, points);
}
