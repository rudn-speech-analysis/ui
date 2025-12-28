export function api(route: string): string {
  return `http://172.26.5.50:3000${route}`;
}

export interface ChannelData {
  self_url: string;
  idx_in_file: number;
  assigned_name: string | null;
  segments_begin_url: string;
  metrics: MetricCollection[];
}

export interface MetricCollection {
  provider: string;
  metrics: Metric[];
  description: string | null;
}

export interface Metric {
  type: string;
  name: string;
  value: number | string | boolean;
  description: string | null;
  unit: string | null;
}

export function findMetricByName(collections: MetricCollection[], name: string) {
  for (const collection of collections) {
    for (const metric of collection.metrics) {
      if (metric.name === name) {
        return metric;
      }
    }
  }
  return null;
}

export interface SegmentData {
  id: string;
  start: number;
  end: number;
  text: string;
  metrics: MetricCollection[];
}

export interface ChannelSegmentData {
  channel: string;
  data: SegmentData;
}
