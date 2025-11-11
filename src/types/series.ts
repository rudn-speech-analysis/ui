export type Timestamp = number;

export class TimeSeries {
  constructor(name: string, points: TimeSeriesPoint[]) {
    this.name = name;
    this.points = points;
  }
  name: string;
  points: TimeSeriesPoint[];

  shift(plusHowMuch: Timestamp) {
    const shifted = this.points.map((p) => ({ ...p, time: p.time + plusHowMuch }));
    return new TimeSeries(this.name, shifted);
  }
}

export class TimeSeriesPoint {
  constructor(time: Timestamp, value: number) {
    this.time = time;
    this.value = value;
  }

  time: Timestamp;
  value: number;
}
