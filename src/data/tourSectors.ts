export interface TourSector {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  telemetry: string;
  videoSrc: string;
  fallbackImage: string;
  startProgress: number;
  endProgress: number;
}

export const TOUR_SECTORS: TourSector[] = [
  {
    id: "gates",
    num: "01",
    title: "ARENA GATES // VIP ENTRY",
    subtitle: "DOUBLE BRUTALIST GATES SWING OPEN • VIP ESCORT LEADS AHEAD",
    telemetry: "WAYPOINT 01 // PORTAL ARCH // VIP ACCESS AUTHORIZED",
    videoSrc: "/images/tour_01_entrance.mp4",
    fallbackImage: "/images/venue_entrance.png",
    startProgress: 0.00,
    endProgress: 0.18,
  },
  {
    id: "upcoming_events",
    num: "02",
    title: "UPCOMING TOUR DATES",
    subtitle: "PHYSICAL STANDING EVENT BANNERS: DELHI • MUMBAI • GOA • DUBAI",
    telemetry: "WAYPOINT 02 // CONFIRMED TOUR STOPS // FLOOR TOTEMS ACTIVE",
    videoSrc: "/images/tour_07_event_corridor.mp4",
    fallbackImage: "/images/tour_corridor_2k.jpg",
    startProgress: 0.18,
    endProgress: 0.42,
  },
  {
    id: "gallery_bio",
    num: "03",
    title: "GALLERY & ABOUT Dj G-Spark",
    subtitle: "LEFT: SUNBURN 55K & ARENA CONCERTS // RIGHT: BIOGRAPHY & PHILOSOPHY",
    telemetry: "WAYPOINT 03 // MUSEUM WALL MOUNTED PANELS // 15+ YEARS",
    videoSrc: "/images/tour_02_backstage.mp4",
    fallbackImage: "/images/gallery_corridor_2k.jpg",
    startProgress: 0.42,
    endProgress: 0.72,
  },
  {
    id: "dj_booth",
    num: "04",
    title: "DJ BOOTH COMMAND DECK",
    subtitle: "4X PIONEER CDJ-3000S, DJM-V10 MIXER & LIVE VU METERS",
    telemetry: "WAYPOINT 04 // 140.0 BPM // SENSORY DROP ARMED",
    videoSrc: "/images/tour_04_dj_performing.mp4",
    fallbackImage: "/images/dj_performing.jpg",
    startProgress: 0.72,
    endProgress: 0.86,
  },
  {
    id: "arena_climax",
    num: "05",
    title: "STADIUM ARENA CLIMAX",
    subtitle: "ROTATING HALO TRUSS, CRYOGENIC GOLD SPARK JETS & 40,000 FANS",
    telemetry: "WAYPOINT 05 // 80M LED WALL // FEEL THE SPARK",
    videoSrc: "/images/tour_09_arena_climax.mp4",
    fallbackImage: "/images/arena_crowd.jpg",
    startProgress: 0.86,
    endProgress: 1.00,
  },
];
