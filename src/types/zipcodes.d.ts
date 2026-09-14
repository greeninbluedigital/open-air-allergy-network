declare module "zipcodes" {
  interface ZipEntry {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }

  export function lookup(zip: string): ZipEntry | undefined;
  export function random(): ZipEntry;
  export function lookupByName(city: string, state: string): ZipEntry[];
  export function lookupByState(state: string): ZipEntry[];
}
