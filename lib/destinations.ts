export const categories = [
  'All',
  'Nature',
  'Food',
  'Culture',
  'Heritage',
  'Adventure',
  'Local Business',
  'Community',
] as const

export type Category = (typeof categories)[number]

export type Destination = {
  id: string
  name: string
  municipality: string
  category: Exclude<Category, 'All'>
  categories?: Exclude<Category, 'All'>[]
  description: string
  image: string
  latitude: number
  longitude: number
  openingTime: string
  closingTime: string
  suggestedDurationMinutes: number
  estimatedCost: string
  accessibility: string
  interests: string[]
  isVerifiedDemo: boolean
}

export const destinations: Destination[] = [
  { id: 'cagsawa-ruins', name: 'Cagsawa Ruins', municipality: 'Daraga', category: 'Heritage', description: 'Historic bell tower framed by an iconic view of Mayon Volcano.', image: '/images/albay-heritage.png', latitude: 13.1668, longitude: 123.7022, openingTime: '8:00 AM', closingTime: '5:00 PM', suggestedDurationMinutes: 90, estimatedCost: '₱50–₱200', accessibility: 'Some paved areas; assistance may be needed.', interests: ['History', 'Photography'], isVerifiedDemo: true },
  { id: 'hoyop-hoyopan-cave', name: 'Hoyop-Hoyopan Cave', municipality: 'Camalig', category: 'Nature', categories: ['Nature', 'Adventure'], description: 'A breezy limestone cave with dramatic chambers and local stories.', image: '/images/albay-nature.png', latitude: 13.1416, longitude: 123.6443, openingTime: '8:00 AM', closingTime: '5:00 PM', suggestedDurationMinutes: 120, estimatedCost: '₱300–₱500', accessibility: 'Uneven terrain; not wheelchair accessible.', interests: ['Nature', 'Adventure'], isVerifiedDemo: true },
  { id: 'daraga-church', name: 'Daraga Church', municipality: 'Daraga', category: 'Culture', categories: ['Culture', 'Heritage'], description: 'An 18th-century hilltop church built from volcanic stone.', image: '/images/albay-heritage.png', latitude: 13.1481, longitude: 123.7124, openingTime: '6:00 AM', closingTime: '7:00 PM', suggestedDurationMinutes: 60, estimatedCost: 'Free', accessibility: 'Steps at the main approach.', interests: ['Culture', 'Architecture'], isVerifiedDemo: true },
  { id: 'sumlang-lake', name: 'Sumlang Lake', municipality: 'Camalig', category: 'Nature', description: 'A calm lakeside escape with bamboo rafts and Mayon views.', image: '/images/albay-nature.png', latitude: 13.1519, longitude: 123.6677, openingTime: '8:00 AM', closingTime: '6:00 PM', suggestedDurationMinutes: 90, estimatedCost: '₱100–₱400', accessibility: 'Mostly level lakeside paths.', interests: ['Nature', 'Relaxation'], isVerifiedDemo: true },
  { id: 'legazpi-boulevard', name: 'Legazpi Boulevard', municipality: 'Legazpi', category: 'Nature', description: 'A scenic coastal promenade for sunsets, walks, and local snacks.', image: '/images/albay-nature.png', latitude: 13.1372, longitude: 123.7517, openingTime: 'Open all day', closingTime: 'Open all day', suggestedDurationMinutes: 60, estimatedCost: 'Free', accessibility: 'Wide, mostly level promenade.', interests: ['Scenic', 'Walking'], isVerifiedDemo: true },
  { id: 'first-colonial-grill', name: '1st Colonial Grill', municipality: 'Legazpi', category: 'Food', description: 'A local dining stop known for Bicolano dishes and sili ice cream.', image: '/images/albay-food.png', latitude: 13.143, longitude: 123.7302, openingTime: '10:00 AM', closingTime: '9:00 PM', suggestedDurationMinutes: 90, estimatedCost: '₱300–₱700', accessibility: 'Contact venue for current access details.', interests: ['Food', 'Local Flavors'], isVerifiedDemo: true },
  { id: 'djc-halo-halo', name: 'DJC Halo-Halo', municipality: 'Legazpi', category: 'Food', description: 'A colorful local merienda featuring creamy halo-halo.', image: '/images/albay-food.png', latitude: 13.1394, longitude: 123.7351, openingTime: '9:00 AM', closingTime: '8:00 PM', suggestedDurationMinutes: 45, estimatedCost: '₱100–₱250', accessibility: 'Contact venue for current access details.', interests: ['Food', 'Desserts'], isVerifiedDemo: true },
  { id: 'daraga-handicrafts', name: 'Daraga Handicraft Shop', municipality: 'Daraga', category: 'Local Business', description: 'Browse locally made abaca pieces, keepsakes, and woven goods.', image: '/images/albay-community.png', latitude: 13.1501, longitude: 123.7112, openingTime: '9:00 AM', closingTime: '6:00 PM', suggestedDurationMinutes: 60, estimatedCost: 'Varies', accessibility: 'Contact shop for current access details.', interests: ['Shopping', 'Crafts'], isVerifiedDemo: true },
  { id: 'community-weaving', name: 'Community Weaving Experience', municipality: 'Legazpi', category: 'Community', categories: ['Community', 'Culture'], description: 'Meet local makers and learn the basics of traditional weaving.', image: '/images/albay-community.png', latitude: 13.1462, longitude: 123.7241, openingTime: '9:00 AM', closingTime: '4:00 PM', suggestedDurationMinutes: 120, estimatedCost: '₱400–₱800', accessibility: 'Advance coordination recommended.', interests: ['Community', 'Culture'], isVerifiedDemo: true },
  { id: 'local-cafe', name: 'Mayon View Local Café', municipality: 'Legazpi', category: 'Food', categories: ['Food', 'Local Business'], description: 'Small-batch coffee, local pastries, and a relaxed neighborhood feel.', image: '/images/albay-food.png', latitude: 13.142, longitude: 123.7271, openingTime: '7:00 AM', closingTime: '8:00 PM', suggestedDurationMinutes: 60, estimatedCost: '₱150–₱350', accessibility: 'Contact café for current access details.', interests: ['Food', 'Local Business'], isVerifiedDemo: true },
  { id: 'scenic-viewpoint', name: 'Mayon Skyline View', municipality: 'Albay', category: 'Nature', description: 'A quiet viewpoint for wide volcanic landscapes and golden-hour light.', image: '/images/albay-nature.png', latitude: 13.2541, longitude: 123.6861, openingTime: '6:00 AM', closingTime: '6:00 PM', suggestedDurationMinutes: 60, estimatedCost: 'Free', accessibility: 'Uneven outdoor terrain.', interests: ['Nature', 'Photography'], isVerifiedDemo: true },
  { id: 'community-guide', name: 'Camalig Community Guide Walk', municipality: 'Camalig', category: 'Community', categories: ['Community', 'Adventure'], description: 'Explore Camalig with a local guide and community-made stories.', image: '/images/albay-community.png', latitude: 13.1823, longitude: 123.6542, openingTime: '8:00 AM', closingTime: '4:00 PM', suggestedDurationMinutes: 180, estimatedCost: '₱500–₱1,000', accessibility: 'Route depends on the chosen walk.', interests: ['Community', 'Adventure'], isVerifiedDemo: true },
]
