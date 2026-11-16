export interface ConsultationFeeRange {
  min: number;
  max: number;
}

type DemoFeeRange = readonly [number, number] | null;

const DEMO_FEES: Record<string, Record<string, DemoFeeRange>> = {
  'Postgraduate Institute of Medical Education and Research (PGIMER)': {
    'General Medicine': [50, 200],
    Orthopedics: [100, 300],
    Cardiology: [150, 500],
    Dermatology: [50, 200],
    Ophthalmology: [50, 200],
    Emergency: null,
  },
  'Government Medical College and Hospital, Sector 32': {
    'General Medicine': [50, 200],
    Orthopedics: [100, 300],
    Cardiology: null,
    Dermatology: [50, 200],
    Ophthalmology: [50, 200],
    Emergency: [150, 600],
  },
  'Government Rajindra Hospital': {
    'General Medicine': [50, 200],
    Orthopedics: [100, 300],
    Cardiology: [150, 400],
    Dermatology: [50, 200],
    Ophthalmology: [50, 200],
    Emergency: [100, 500],
  },
  'Mata Kaushalya Hospital': {
    'General Medicine': [50, 200],
    Orthopedics: [100, 300],
    Cardiology: [150, 400],
    Dermatology: null,
    Ophthalmology: [50, 200],
    Emergency: [100, 500],
  },
};

export function getConsultationFeeRange(
  hospitalName: string,
  department: string,
  feeMin: number | null,
  feeMax: number | null,
): ConsultationFeeRange | null {
  if (feeMin !== null && feeMax !== null) {
    return { min: feeMin, max: feeMax };
  }
  if (feeMin !== null || feeMax !== null) {
    return null;
  }
  const demoFee = DEMO_FEES[hospitalName]?.[department];
  return demoFee ? { min: demoFee[0], max: demoFee[1] } : null;
}
