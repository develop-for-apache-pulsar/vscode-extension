enum SeekPositionMilliseconds {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "15s" = (15 * 1000),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "1m" = (60 * 1000),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "5m" = (5 * 60 * 1000),
}

export class WatchConfig {
  constructor(public keepAlive: number = 0,
              public readonly queue: {
                seekPosition: SeekPositionMilliseconds
                memorySize: number, // in mb
                readMessageTimeout: number,
              } = {
                seekPosition: SeekPositionMilliseconds["15s"],
                memorySize: 50,//mb
                readMessageTimeout: 1000,
              }) {
  }
}