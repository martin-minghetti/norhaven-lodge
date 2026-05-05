export type DateRange = { checkIn: string; checkOut: string };

export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.checkIn <= b.checkOut && b.checkIn <= a.checkOut;
}
