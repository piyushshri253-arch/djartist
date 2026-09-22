export interface Chapter {
  num: string;
  title: string;
  subtitle: string;
  target: number;
}

export const CHAPTERS: Chapter[] = [
  { num: "01", title: "ARRIVAL", subtitle: "FEEL THE SPARK", target: 0.00 },
  { num: "02", title: "BACKSTAGE", subtitle: "BEHIND EVERY MOMENT", target: 0.15 },
  { num: "03", title: "ENTRANCE", subtitle: "ENTER THE SOUND", target: 0.28 },
  { num: "04", title: "THE BOOTH", subtitle: "WHERE ENERGY BEGINS", target: 0.42 },
  { num: "05", title: "Dj G-Spark", subtitle: "THE ARTIST IN ORBIT", target: 0.50 },
  { num: "06", title: "LED TUNNEL", subtitle: "OPTICAL FREQUENCIES", target: 0.66 },
  { num: "07", title: "THE ENERGY", subtitle: "ONE ROOM. ONE FREQUENCY.", target: 0.76 },
  { num: "08", title: "TOUR CIRCUIT", subtitle: "GLOBAL ARENA DATES", target: 0.84 },
  { num: "09", title: "ARCHIVES", subtitle: "LEGENDARY NIGHTS", target: 0.90 },
  { num: "10", title: "FINAL ARENA", subtitle: "40,000 UNITED", target: 1.00 },
];
