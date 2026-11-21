import type { ActiveLocation } from '../types/platform';

export interface IndianDistrictNode {
  name: string;
  cities: string[];
  lat: number;
  lng: number;
}

export interface IndianStateNode {
  name: string;
  code: string;
  type: 'State' | 'Union Territory';
  capital: string;
  lat: number;
  lng: number;
  districts: IndianDistrictNode[];
}

// Structured national geography covering all 28 Indian States & 8 Union Territories
export const INDIA_STATES_AND_UTS: IndianStateNode[] = [
  {
    name: 'West Bengal',
    code: 'WB',
    type: 'State',
    capital: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    districts: [
      { name: 'Kolkata', cities: ['Salt Lake', 'Ballygunge', 'Behala', 'Jadavpur', 'Esplanade'], lat: 22.5726, lng: 88.3639 },
      { name: 'Howrah', cities: ['Howrah City', 'Uluberia', 'Bally', 'Domjur'], lat: 22.5958, lng: 88.2636 },
      { name: 'North 24 Parganas', cities: ['Barasat', 'Barrackpore', 'Basirhat', 'Bangaon', 'New Town'], lat: 22.7219, lng: 88.4812 },
      { name: 'South 24 Parganas', cities: ['Baruipur', 'Diamond Harbour', 'Canning', 'Sonarpur'], lat: 22.3654, lng: 88.4326 },
      { name: 'Hooghly', cities: ['Chinsurah', 'Serampore', 'Chandannagar', 'Arambagh'], lat: 22.9089, lng: 88.3967 },
      { name: 'Purba Bardhaman', cities: ['Bardhaman', 'Katwa', 'Kalna', 'Memari'], lat: 23.2324, lng: 87.8615 },
      { name: 'Paschim Bardhaman', cities: ['Durgapur', 'Asansol', 'Raniganj', 'Andal'], lat: 23.5204, lng: 87.3119 },
      { name: 'Purba Medinipur', cities: ['Tamluk', 'Haldia', 'Contai', 'Egra'], lat: 22.2995, lng: 87.9212 },
      { name: 'Paschim Medinipur', cities: ['Medinipur', 'Kharagpur', 'Ghatal', 'Garhbeta'], lat: 22.4257, lng: 87.3199 },
      { name: 'Darjeeling', cities: ['Siliguri', 'Darjeeling Town', 'Kurseong', 'Mirik'], lat: 26.7271, lng: 88.3953 },
      { name: 'Nadia', cities: ['Krishnanagar', 'Kalyani', 'Ranaghat', 'Nabadwip'], lat: 23.4013, lng: 88.5015 },
      { name: 'Murshidabad', cities: ['Berhampore', 'Jangipur', 'Lalbagh', 'Kandi'], lat: 24.0983, lng: 88.2498 },
      { name: 'Malda', cities: ['English Bazar', 'Chanchal', 'Old Malda'], lat: 25.0108, lng: 88.1411 },
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    type: 'State',
    capital: 'Mumbai',
    lat: 19.076,
    lng: 72.8777,
    districts: [
      { name: 'Mumbai', cities: ['Andheri', 'Dadar', 'Bandra', 'Kurla', 'Borivali'], lat: 19.076, lng: 72.8777 },
      { name: 'Pune', cities: ['Pune City', 'Pimpri-Chinchwad', 'Baramati', 'Hinjewadi'], lat: 18.5204, lng: 73.8567 },
      { name: 'Nagpur', cities: ['Nagpur City', 'Kamptee', 'Hingna'], lat: 21.1458, lng: 79.0882 },
      { name: 'Nashik', cities: ['Nashik City', 'Malegaon', 'Igatpuri'], lat: 19.9975, lng: 73.7898 },
      { name: 'Thane', cities: ['Thane West', 'Kalyan', 'Navi Mumbai', 'Bhiwandi'], lat: 19.2183, lng: 72.9781 },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    type: 'State',
    capital: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    districts: [
      { name: 'Bengaluru Urban', cities: ['Bengaluru Central', 'Whitefield', 'Yelahanka', 'Electronic City'], lat: 12.9716, lng: 77.5946 },
      { name: 'Mysuru', cities: ['Mysuru City', 'Nanjangud', 'Hunsur'], lat: 12.2958, lng: 76.6394 },
      { name: 'Dakshina Kannada', cities: ['Mangaluru', 'Puttur', 'Bantwal'], lat: 12.9141, lng: 74.856 },
      { name: 'Dharwad', cities: ['Hubballi', 'Dharwad City', 'Kalghatgi'], lat: 15.3647, lng: 75.124 },
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    type: 'State',
    capital: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    districts: [
      { name: 'Chennai', cities: ['T. Nagar', 'Adyar', 'Tambaram', 'Ambattur'], lat: 13.0827, lng: 80.2707 },
      { name: 'Coimbatore', cities: ['Coimbatore City', 'Pollachi', 'Mettupalayam'], lat: 11.0168, lng: 76.9558 },
      { name: 'Madurai', cities: ['Madurai City', 'Thirumangalam', 'Melur'], lat: 9.9252, lng: 78.1198 },
      { name: 'Tiruchirappalli', cities: ['Trichy City', 'Srirangam', 'Lalgudi'], lat: 10.7905, lng: 78.7047 },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    type: 'State',
    capital: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    districts: [
      { name: 'Lucknow', cities: ['Gomti Nagar', 'Alambagh', 'Hazratganj', 'Mohanlalganj'], lat: 26.8467, lng: 80.9462 },
      { name: 'Varanasi', cities: ['Varanasi City', 'Sarnath', 'Ramnagar'], lat: 25.3176, lng: 82.9739 },
      { name: 'Gautam Buddha Nagar', cities: ['Noida', 'Greater Noida', 'Dadri'], lat: 28.5355, lng: 77.391 },
      { name: 'Prayagraj', cities: ['Civil Lines', 'Naini', 'Phulpur'], lat: 25.4358, lng: 81.8463 },
      { name: 'Kanpur Nagar', cities: ['Kanpur City', 'Kalyanpur', 'Bithoor'], lat: 26.4499, lng: 80.3319 },
    ],
  },
  {
    name: 'Delhi',
    code: 'DL',
    type: 'Union Territory',
    capital: 'New Delhi',
    lat: 28.6139,
    lng: 77.209,
    districts: [
      { name: 'New Delhi', cities: ['Connaught Place', 'Chanakyapuri', 'Vasant Vihar'], lat: 28.6139, lng: 77.209 },
      { name: 'South Delhi', cities: ['Saket', 'Hauz Khas', 'Mehrauli', 'Kalkaji'], lat: 28.5245, lng: 77.2066 },
      { name: 'East Delhi', cities: ['Mayur Vihar', 'Preet Vihar', 'Laxmi Nagar'], lat: 28.6279, lng: 77.2947 },
      { name: 'North West Delhi', cities: ['Rohini', 'Pitampura', 'Narela'], lat: 28.7495, lng: 77.0565 },
    ],
  },
  {
    name: 'Odisha',
    code: 'OD',
    type: 'State',
    capital: 'Bhubaneswar',
    lat: 20.2961,
    lng: 85.8245,
    districts: [
      { name: 'Khordha', cities: ['Bhubaneswar', 'Jatni', 'Khordha Town'], lat: 20.2961, lng: 85.8245 },
      { name: 'Cuttack', cities: ['Cuttack City', 'Choudwar', 'Athagarh'], lat: 20.4625, lng: 85.883 },
      { name: 'Puri', cities: ['Puri Town', 'Konark', 'Pipili'], lat: 19.8135, lng: 85.8312 },
      { name: 'Sundargarh', cities: ['Rourkela', 'Sundargarh Town', 'Rajgangpur'], lat: 22.2604, lng: 84.8536 },
    ],
  },
  {
    name: 'Bihar',
    code: 'BR',
    type: 'State',
    capital: 'Patna',
    lat: 25.5941,
    lng: 85.1376,
    districts: [
      { name: 'Patna', cities: ['Patna City', 'Danapur', 'Bihta', 'Barh'], lat: 25.5941, lng: 85.1376 },
      { name: 'Gaya', cities: ['Gaya Town', 'Bodh Gaya', 'Sherghati'], lat: 24.7914, lng: 85.0002 },
      { name: 'Muzaffarpur', cities: ['Muzaffarpur City', 'Motipur', 'Kanti'], lat: 26.1209, lng: 85.3647 },
      { name: 'Bhagalpur', cities: ['Bhagalpur City', 'Sultanganj', 'Kahalgaon'], lat: 25.2425, lng: 86.9842 },
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    type: 'State',
    capital: 'Gandhinagar',
    lat: 23.0225,
    lng: 72.5714,
    districts: [
      { name: 'Ahmedabad', cities: ['Ahmedabad City', 'Sanand', 'Dholka'], lat: 23.0225, lng: 72.5714 },
      { name: 'Surat', cities: ['Surat City', 'Bardoli', 'Navsari Road'], lat: 21.1702, lng: 72.8311 },
      { name: 'Vadodara', cities: ['Vadodara City', 'Karjan', 'Padra'], lat: 22.3072, lng: 73.1812 },
      { name: 'Rajkot', cities: ['Rajkot City', 'Gondal', 'Jetpur'], lat: 22.3039, lng: 70.8022 },
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    type: 'State',
    capital: 'Jaipur',
    lat: 26.9124,
    lng: 75.7873,
    districts: [
      { name: 'Jaipur', cities: ['Jaipur City', 'Sanganer', 'Amber', 'Chomu'], lat: 26.9124, lng: 75.7873 },
      { name: 'Jodhpur', cities: ['Jodhpur City', 'Osian', 'Bilara'], lat: 26.2389, lng: 73.0243 },
      { name: 'Udaipur', cities: ['Udaipur City', 'Mavli', 'Salumber'], lat: 24.5854, lng: 73.7125 },
      { name: 'Kota', cities: ['Kota City', 'Ramganj Mandi', 'Sangod'], lat: 25.2138, lng: 75.8648 },
    ],
  },
  {
    name: 'Telangana',
    code: 'TG',
    type: 'State',
    capital: 'Hyderabad',
    lat: 17.385,
    lng: 78.4867,
    districts: [
      { name: 'Hyderabad', cities: ['Secunderabad', 'Madhapur', 'Charminar', 'Kukatpally'], lat: 17.385, lng: 78.4867 },
      { name: 'Warangal', cities: ['Warangal City', 'Hanamkonda', 'Kazipet'], lat: 17.9689, lng: 79.5941 },
    ],
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    type: 'State',
    capital: 'Amaravati',
    lat: 16.5062,
    lng: 80.648,
    districts: [
      { name: 'Visakhapatnam', cities: ['Vizag City', 'Gajuwaka', 'Bheemunipatnam'], lat: 17.6868, lng: 83.2185 },
      { name: 'NTR (Vijayawada)', cities: ['Vijayawada', 'Nandigama', 'Jaggayyapeta'], lat: 16.5062, lng: 80.648 },
      { name: 'Tirupati', cities: ['Tirupati City', 'Srikalahasti', 'Gudur'], lat: 13.6288, lng: 79.4192 },
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    type: 'State',
    capital: 'Thiruvananthapuram',
    lat: 8.5241,
    lng: 76.9366,
    districts: [
      { name: 'Ernakulam', cities: ['Kochi', 'Aluva', 'Muvattupuzha'], lat: 9.9312, lng: 76.2673 },
      { name: 'Thiruvananthapuram', cities: ['Trivandrum City', 'Neyyattinkara', 'Attingal'], lat: 8.5241, lng: 76.9366 },
      { name: 'Kozhikode', cities: ['Kozhikode City', 'Vadakara', 'Koyilandy'], lat: 11.2588, lng: 75.7804 },
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    type: 'State',
    capital: 'Bhopal',
    lat: 23.2599,
    lng: 77.4126,
    districts: [
      { name: 'Bhopal', cities: ['Bhopal City', 'Kolar', 'Berasia'], lat: 23.2599, lng: 77.4126 },
      { name: 'Indore', cities: ['Indore City', 'Mhow', 'Depalpur'], lat: 22.7196, lng: 75.8577 },
      { name: 'Gwalior', cities: ['Gwalior City', 'Dabra', 'Morar'], lat: 26.2183, lng: 78.1828 },
    ],
  },
  {
    name: 'Assam',
    code: 'AS',
    type: 'State',
    capital: 'Dispur',
    lat: 26.1445,
    lng: 91.7362,
    districts: [
      { name: 'Kamrup Metropolitan', cities: ['Guwahati', 'Dispur', 'Azara'], lat: 26.1445, lng: 91.7362 },
      { name: 'Dibrugarh', cities: ['Dibrugarh Town', 'Naharkatia', 'Moran'], lat: 27.4728, lng: 94.912 },
      { name: 'Cachar', cities: ['Silchar', 'Lakhipur', 'Sonai'], lat: 24.8333, lng: 92.7789 },
    ],
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    type: 'State',
    capital: 'Ranchi',
    lat: 23.3441,
    lng: 85.3096,
    districts: [
      { name: 'Ranchi', cities: ['Ranchi City', 'Hatia', 'Kanke'], lat: 23.3441, lng: 85.3096 },
      { name: 'East Singhbhum', cities: ['Jamshedpur', 'Ghatshila', 'Chakulia'], lat: 22.8046, lng: 86.2029 },
      { name: 'Dhanbad', cities: ['Dhanbad City', 'Jharia', 'Sindri'], lat: 23.7957, lng: 86.4304 },
    ],
  },
  {
    name: 'Punjab',
    code: 'PB',
    type: 'State',
    capital: 'Chandigarh',
    lat: 30.901,
    lng: 75.8573,
    districts: [
      { name: 'Ludhiana', cities: ['Ludhiana City', 'Khanna', 'Jagraon'], lat: 30.901, lng: 75.8573 },
      { name: 'Amritsar', cities: ['Amritsar City', 'Ajnala', 'Baba Bakala'], lat: 31.634, lng: 74.8723 },
      { name: 'Jalandhar', cities: ['Jalandhar City', 'Phagwara', 'Nakodar'], lat: 31.326, lng: 75.5762 },
    ],
  },
  {
    name: 'Haryana',
    code: 'HR',
    type: 'State',
    capital: 'Chandigarh',
    lat: 28.4595,
    lng: 77.0266,
    districts: [
      { name: 'Gurugram', cities: ['Gurugram City', 'Sohna', 'Manesar'], lat: 28.4595, lng: 77.0266 },
      { name: 'Faridabad', cities: ['Faridabad City', 'Ballabhgarh'], lat: 28.4089, lng: 77.3178 },
      { name: 'Hisar', cities: ['Hisar City', 'Hansi', 'Barwala'], lat: 29.1492, lng: 75.7217 },
    ],
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    type: 'State',
    capital: 'Raipur',
    lat: 21.2514,
    lng: 81.6296,
    districts: [
      { name: 'Raipur', cities: ['Raipur City', 'Nava Raipur', 'Arang'], lat: 21.2514, lng: 81.6296 },
      { name: 'Bilaspur', cities: ['Bilaspur City', 'Takhatpur', 'Kota'], lat: 22.0797, lng: 82.1409 },
    ],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    type: 'State',
    capital: 'Dehradun',
    lat: 30.3165,
    lng: 78.0322,
    districts: [
      { name: 'Dehradun', cities: ['Dehradun City', 'Rishikesh', 'Mussoorie'], lat: 30.3165, lng: 78.0322 },
      { name: 'Nainital', cities: ['Haldwani', 'Nainital Town', 'Ramnagar'], lat: 29.2183, lng: 79.513 },
    ],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    type: 'State',
    capital: 'Shimla',
    lat: 31.1048,
    lng: 77.1734,
    districts: [
      { name: 'Shimla', cities: ['Shimla City', 'Rohru', 'Rampur'], lat: 31.1048, lng: 77.1734 },
      { name: 'Kangra', cities: ['Dharamshala', 'Palampur', 'Kangra Town'], lat: 32.219, lng: 76.3234 },
    ],
  },
  {
    name: 'Tripura',
    code: 'TR',
    type: 'State',
    capital: 'Agartala',
    lat: 23.8315,
    lng: 91.2868,
    districts: [{ name: 'West Tripura', cities: ['Agartala', 'Jirania', 'Mohanpur'], lat: 23.8315, lng: 91.2868 }],
  },
  {
    name: 'Goa',
    code: 'GA',
    type: 'State',
    capital: 'Panaji',
    lat: 15.4909,
    lng: 73.8278,
    districts: [
      { name: 'North Goa', cities: ['Panaji', 'Mapusa', 'Ponda'], lat: 15.4909, lng: 73.8278 },
      { name: 'South Goa', cities: ['Margao', 'Vasco da Gama'], lat: 15.2832, lng: 73.9862 },
    ],
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    type: 'State',
    capital: 'Shillong',
    lat: 25.5788,
    lng: 91.8933,
    districts: [{ name: 'East Khasi Hills', cities: ['Shillong', 'Sohra'], lat: 25.5788, lng: 91.8933 }],
  },
  {
    name: 'Manipur',
    code: 'MN',
    type: 'State',
    capital: 'Imphal',
    lat: 24.817,
    lng: 93.9368,
    districts: [{ name: 'Imphal West', cities: ['Imphal City', 'Lamphelpat'], lat: 24.817, lng: 93.9368 }],
  },
  {
    name: 'Nagaland',
    code: 'NL',
    type: 'State',
    capital: 'Kohima',
    lat: 25.6751,
    lng: 94.1086,
    districts: [
      { name: 'Kohima', cities: ['Kohima Town'], lat: 25.6751, lng: 94.1086 },
      { name: 'Dimapur', cities: ['Dimapur City'], lat: 25.9091, lng: 93.7266 },
    ],
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    type: 'State',
    capital: 'Itanagar',
    lat: 27.0844,
    lng: 93.6053,
    districts: [{ name: 'Papum Pare', cities: ['Itanagar', 'Naharlagun'], lat: 27.0844, lng: 93.6053 }],
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    type: 'State',
    capital: 'Aizawl',
    lat: 23.7271,
    lng: 92.7176,
    districts: [{ name: 'Aizawl', cities: ['Aizawl City'], lat: 23.7271, lng: 92.7176 }],
  },
  {
    name: 'Sikkim',
    code: 'SK',
    type: 'State',
    capital: 'Gangtok',
    lat: 27.3389,
    lng: 88.6065,
    districts: [{ name: 'Gangtok', cities: ['Gangtok Town', 'Singtam'], lat: 27.3389, lng: 88.6065 }],
  },
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    type: 'Union Territory',
    capital: 'Srinagar / Jammu',
    lat: 34.0837,
    lng: 74.7973,
    districts: [
      { name: 'Srinagar', cities: ['Srinagar City'], lat: 34.0837, lng: 74.7973 },
      { name: 'Jammu', cities: ['Jammu City'], lat: 32.7266, lng: 74.857 },
    ],
  },
  {
    name: 'Ladakh',
    code: 'LA',
    type: 'Union Territory',
    capital: 'Leh',
    lat: 34.1526,
    lng: 77.5771,
    districts: [{ name: 'Leh', cities: ['Leh Town', 'Kargil'], lat: 34.1526, lng: 77.5771 }],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    type: 'Union Territory',
    capital: 'Chandigarh',
    lat: 30.7333,
    lng: 76.7794,
    districts: [{ name: 'Chandigarh', cities: ['Sector 17', 'Manimajra'], lat: 30.7333, lng: 76.7794 }],
  },
  {
    name: 'Puducherry',
    code: 'PY',
    type: 'Union Territory',
    capital: 'Puducherry',
    lat: 11.9416,
    lng: 79.8083,
    districts: [{ name: 'Puducherry', cities: ['Puducherry City', 'Karaikal'], lat: 11.9416, lng: 79.8083 }],
  },
  {
    name: 'Andaman and Nicobar Islands',
    code: 'AN',
    type: 'Union Territory',
    capital: 'Sri Vijaya Puram',
    lat: 11.6234,
    lng: 92.7265,
    districts: [{ name: 'South Andaman', cities: ['Sri Vijaya Puram (Port Blair)'], lat: 11.6234, lng: 92.7265 }],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    code: 'DN',
    type: 'Union Territory',
    capital: 'Daman',
    lat: 20.3974,
    lng: 72.8328,
    districts: [{ name: 'Daman & Silvassa', cities: ['Daman', 'Silvassa', 'Diu'], lat: 20.3974, lng: 72.8328 }],
  },
  {
    name: 'Lakshadweep',
    code: 'LD',
    type: 'Union Territory',
    capital: 'Kavaratti',
    lat: 10.5667,
    lng: 72.6417,
    districts: [{ name: 'Lakshadweep', cities: ['Kavaratti', 'Agatti'], lat: 10.5667, lng: 72.6417 }],
  },
];

export const DEFAULT_ACTIVE_LOCATION: ActiveLocation = {
  country: 'India',
  state: 'West Bengal',
  district: 'Kolkata',
  cityOrLocality: 'Kolkata',
  lat: 22.5726,
  lng: 88.3639,
  radiusMode: '50',
  customRadiusKm: 35,
  source: 'manual',
};

export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getEffectiveRadiusKm(loc: ActiveLocation): number | null {
  if (loc.radiusMode === 'nationwide' || loc.radiusMode === 'remote') return null;
  if (loc.radiusMode === 'custom') return Math.max(2, Math.min(500, loc.customRadiusKm || 25));
  return Number(loc.radiusMode) || 25;
}

/**
 * Maps optional browser GPS coordinates to the nearest Indian State + District centre
 * so raw private residential coordinates are never stored or exposed.
 */
export function findNearestIndianLocation(
  rawLat: number,
  rawLng: number
): { state: string; district: string; cityOrLocality: string; lat: number; lng: number } {
  let best = {
    state: 'West Bengal',
    district: 'Kolkata',
    cityOrLocality: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    dist: Infinity,
  };

  for (const st of INDIA_STATES_AND_UTS) {
    for (const distNode of st.districts) {
      const d = haversineDistanceKm(rawLat, rawLng, distNode.lat, distNode.lng);
      if (d < best.dist) {
        best = {
          state: st.name,
          district: distNode.name,
          cityOrLocality: distNode.cities[0] || distNode.name,
          lat: distNode.lat,
          lng: distNode.lng,
          dist: d,
        };
      }
    }
  }

  return {
    state: best.state,
    district: best.district,
    cityOrLocality: best.cityOrLocality,
    lat: best.lat,
    lng: best.lng,
  };
}

export function getCoordinatesForPlace(
  stateName?: string,
  districtName?: string
): { lat: number; lng: number } | null {
  if (!stateName) return null;
  const st = INDIA_STATES_AND_UTS.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );
  if (!st) return null;
  if (districtName) {
    const d = st.districts.find(
      (dist) => dist.name.toLowerCase() === districtName.toLowerCase()
    );
    if (d) return { lat: d.lat, lng: d.lng };
  }
  return { lat: st.lat, lng: st.lng };
}

/**
 * Resolves approximate public coordinates and state metadata from location text
 * so legacy and newly submitted entries seamlessly support Haversine distance filtering.
 */
export function inferGeoFromLocationText(locationText: string): {
  state?: string;
  district?: string;
  lat?: number;
  lng?: number;
  isPanIndia: boolean;
  isRemote: boolean;
} {
  const lower = (locationText || '').toLowerCase();
  const isRemote = /remote|work from home|online|wfh|hybrid/i.test(lower);
  const isPanIndia = /pan-india|all india|nationwide|national|all states/i.test(lower);

  for (const st of INDIA_STATES_AND_UTS) {
    for (const d of st.districts) {
      if (
        lower.includes(d.name.toLowerCase()) ||
        d.cities.some((c) => lower.includes(c.toLowerCase()))
      ) {
        return {
          state: st.name,
          district: d.name,
          lat: d.lat,
          lng: d.lng,
          isPanIndia,
          isRemote,
        };
      }
    }
    if (lower.includes(st.name.toLowerCase())) {
      return {
        state: st.name,
        district: st.districts[0]?.name,
        lat: st.lat,
        lng: st.lng,
        isPanIndia,
        isRemote,
      };
    }
  }

  return { isPanIndia: isPanIndia || isRemote, isRemote };
}
