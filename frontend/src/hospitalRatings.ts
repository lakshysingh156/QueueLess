export interface HospitalRating {
  score: number;
  reviewsCount: number;
  satisfactionRate: number;
  highlight: string;
  tags: string[];
  reviews: Array<{
    author: string;
    location: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

const RATINGS_POOL = [
  { score: 4.8, reviews: 2840, sat: 96, highlight: 'Top rated for cardiology & emergency response' },
  { score: 4.6, reviews: 1950, sat: 92, highlight: 'High patient satisfaction for general medicine' },
  { score: 4.9, reviews: 3420, sat: 98, highlight: 'Ranked #1 for joint replacement & orthopedic care' },
  { score: 4.7, reviews: 2180, sat: 94, highlight: 'Praised for short intake wait times and diagnostics' },
  { score: 4.8, reviews: 3100, sat: 95, highlight: 'State-of-the-art trauma facilities and ICU care' },
  { score: 4.5, reviews: 1420, sat: 90, highlight: 'Affordable high-volume tertiary care' },
  { score: 4.7, reviews: 2650, sat: 93, highlight: 'Quick token check-in and experienced senior clinicians' },
  { score: 4.9, reviews: 4120, sat: 97, highlight: 'Exemplary surgical care and outpatient facilities' },
];

export function getHospitalRating(hospitalId: number, _hospitalName?: string): HospitalRating {
  const index = Math.abs(hospitalId - 1) % RATINGS_POOL.length;
  const base = RATINGS_POOL[index];

  return {
    score: base.score,
    reviewsCount: base.reviews,
    satisfactionRate: base.sat,
    highlight: base.highlight,
    tags: ['Verified OPD Care', 'Prompt Triage', 'Clean Facilities'],
    reviews: [
      {
        author: 'Rajiv M.',
        location: 'New Delhi',
        rating: 5,
        date: '2 days ago',
        comment:
          'Booking the OPD token online saved us at least 45 minutes of counter queuing. The estimated wait window was accurate.',
      },
      {
        author: 'Priya S.',
        location: 'Gurugram',
        rating: 5,
        date: '1 week ago',
        comment:
          'Very well managed outpatient crowd. Doctors were thorough and the nursing staff was helpful during preliminary tests.',
      },
      {
        author: 'Amit K.',
        location: 'Noida',
        rating: 4,
        date: '2 weeks ago',
        comment:
          'Clear directions from the front registration desk. The queue moved quickly compared to traditional hospital visits.',
      },
    ],
  };
}
