export interface City 
{
    id: string;
    name: string;
    lat: number;
    lon: number;
}

export const CITIES: City[] = 
[
    { id: '9766527f2b5d3e95d4a733fcfb77bd7e', name: 'Kab. Bekasi', lat: -6.2383, lon: 106.9756 },
    { id: '58a2fc6ed39fd083f55d4182bf88826d', name: 'DKI Jakarta', lat: -6.2088, lon: 106.8456 },
    { id: 'fc221309746013ac554571fbd180e1c8', name: 'Bandung', lat: -6.9175, lon: 107.6191 },
    { id: '4734ba6f3de83d861c3176a6273cac6d', name: 'Surabaya', lat: -7.2575, lon: 112.7521 },
    { id: '577ef1154f3240ad5b9b413aa7346a1e', name: 'Yogyakarta', lat: -7.7955, lon: 110.3695 },
    { id: '74db120f0a8e5646ef5a30154e9f6deb', name: 'Semarang', lat: -6.9667, lon: 110.4167 }, 
];

export const MONTHS = 
[
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const DEFAULT_CITY_ID = '9766527f2b5d3e95d4a733fcfb77bd7e'; // Kab. Bekasi
export const DATE_FORMAT_API = 'yyyy-MM-dd';
