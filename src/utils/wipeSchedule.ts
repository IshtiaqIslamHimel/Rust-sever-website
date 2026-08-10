const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type WipeType = 'map' | 'force';

export interface WipeEvent {
  time: number;
  type: WipeType;
}

export const getNextWeeklyUtc = (
  now: number,
  weekday: number,
  hour: number,
  minute: number
) => {
  const current = new Date(now);
  const candidate = Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate(),
    hour,
    minute
  );
  const daysAhead = (weekday - current.getUTCDay() + 7) % 7;
  const next = candidate + daysAhead * 24 * 60 * 60 * 1000;
  return next > now ? next : next + WEEK_MS;
};

export const getNextFirstFridayUtc = (now: number) => {
  const current = new Date(now);
  const firstFriday = (year: number, month: number) => {
    const firstDay = new Date(Date.UTC(year, month, 1));
    const date = 1 + ((5 - firstDay.getUTCDay() + 7) % 7);
    return Date.UTC(year, month, date, 11, 30);
  };
  const thisMonth = firstFriday(current.getUTCFullYear(), current.getUTCMonth());
  return thisMonth > now
    ? thisMonth
    : firstFriday(current.getUTCFullYear(), current.getUTCMonth() + 1);
};

export const getWipeWindow = (now: number): { last: WipeEvent; next: WipeEvent } => {
  const nextFriday = getNextWeeklyUtc(now, 5, 11, 30);
  const previousFriday = nextFriday - WEEK_MS;
  return {
    last: { time: previousFriday, type: 'map' },
    next: { time: nextFriday, type: 'map' }
  };
};
