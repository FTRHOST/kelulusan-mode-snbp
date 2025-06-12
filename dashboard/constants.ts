
import { Jurusan, StatusKelulusan, Student } from './types.ts';

export const DEFAULT_API_BASE_URL = "https://api.manubanyuputih.id/";
export const USER_API_BASE_URL_KEY = 'userDefinedApiBaseUrl';

interface AppConfig {
  apiBaseUrl: string;
}

let loadedAppConfig: AppConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
};

export const loadAppConfigFromServer = async (): Promise<void> => {
  try {
    const response = await fetch('/config.json'); 
    if (response.ok) {
      const config = await response.json();
      if (config && typeof config.apiBaseUrl === 'string' && config.apiBaseUrl.trim() !== '') {
        loadedAppConfig.apiBaseUrl = config.apiBaseUrl.trim();
        console.info('API configuration loaded from config.json:', loadedAppConfig.apiBaseUrl);
      } else {
        console.warn('config.json is missing or has an invalid apiBaseUrl. Using hardcoded default API base URL for config.json fallback.');
        loadedAppConfig.apiBaseUrl = DEFAULT_API_BASE_URL;
      }
    } else {
      console.warn(`Failed to load config.json (status: ${response.status}). Using hardcoded default API base URL.`);
      loadedAppConfig.apiBaseUrl = DEFAULT_API_BASE_URL;
    }
  } catch (error) {
    console.error('Error fetching or parsing config.json:', error, '. Using hardcoded default API base URL.');
    loadedAppConfig.apiBaseUrl = DEFAULT_API_BASE_URL;
  }
};

export const getApiBaseUrl = (): string => {
  try {
    const userDefinedUrl = localStorage.getItem(USER_API_BASE_URL_KEY);
    if (userDefinedUrl && userDefinedUrl.trim() !== '') {
      if (userDefinedUrl.startsWith('http://') || userDefinedUrl.startsWith('https://')) {
        return userDefinedUrl.trim();
      } else {
        console.warn(`Invalid user-defined API URL in localStorage: "${userDefinedUrl}". Falling back.`);
      }
    }
  } catch (e) {
    console.error("Error accessing localStorage for API base URL:", e);
  }

  if (loadedAppConfig.apiBaseUrl && (loadedAppConfig.apiBaseUrl.startsWith('http://') || loadedAppConfig.apiBaseUrl.startsWith('https://'))) {
      return loadedAppConfig.apiBaseUrl;
  }
  
  return DEFAULT_API_BASE_URL;
};

export const getApiEndpointSiswa = (): string => {
  return `${getApiBaseUrl()}/api/kelulusan/`; 
};

/**
 * Parses a string assumed to be WIB (if naive) or a full ISO string into a Date object.
 * If the string is naive (e.g., "YYYY-MM-DDTHH:MM:SS" without Z or offset),
 * it's assumed to be WIB and "+07:00" is appended to ensure correct parsing.
 * @param wibIsoString The ISO string, potentially naive WIB.
 * @returns A Date object or null if parsing fails.
 */
export const parseServerWibStringToDate = (wibIsoString: string | null): Date | null => {
  if (!wibIsoString) return null;
  try {
    let dateInputString = wibIsoString;
    // Regex to check if the string ends with Z or a timezone offset like +00:00 or -07:00
    const hasTimezoneSuffix = /Z|([+-]\d{2}:\d{2})$/.test(wibIsoString);

    // If it's a naive datetime string (no Z and no offset) and contains 'T', assume it's WIB.
    // Append +07:00 to make it explicit for the Date constructor.
    if (!hasTimezoneSuffix && wibIsoString.includes('T')) {
      dateInputString = wibIsoString + "+07:00"; // Corrected from +00:00
    }
    // Note: If wibIsoString is just a date like "2023-01-01", new Date("2023-01-01") interprets it as UTC midnight.
    // For "Hari, Tanggal, waktu" format, we expect a time component.
    // If it's a full ISO string with Z or offset, it's used as is.

    const date = new Date(dateInputString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (e) {
    console.error("Error parsing server WIB string to Date:", wibIsoString, e);
    return null;
  }
};

/**
 * Formats a Date object into a string suitable for datetime-local input (YYYY-MM-DDTHH:MM).
 * Uses the browser's local timezone components from the Date object.
 * @param date The Date object.
 * @returns A string in YYYY-MM-DDTHH:MM format, or empty string if date is null/invalid.
 */
export const formatDateToLocalInput = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


// Helper function to convert local datetime-local input string to UTC ISO string
export const formatLocalInputToUtcISO = (localInputString: string | null): string | null => {
  if (!localInputString || localInputString.trim() === '') return null;
  try {
    // new Date() parses the localInputString as local time if no timezone specified
    const date = new Date(localInputString);
    if (isNaN(date.getTime())) return null; // Invalid date
    return date.toISOString(); // Converts this local time to UTC ISO string
  } catch (e) {
    console.error("Error formatting local input string to UTC ISO:", localInputString, e);
    return null;
  }
};

/**
 * Converts local datetime-local input string to a compensated UTC ISO string.
 * This function subtracts 7 hours from the actual UTC equivalent of the local time.
 * This is a workaround for an API that seems to incorrectly add 7 hours to the received UTC time.
 * @param localInputString The datetime string from a datetime-local input (e.g., "YYYY-MM-DDTHH:MM").
 * @returns A compensated UTC ISO string, or null if input is invalid/empty.
 */
export const formatLocalInputToCompensatedUtcISO = (localInputString: string | null): string | null => {
  if (!localInputString || localInputString.trim() === '') return null;
  try {
    // Create a Date object from the localInputString.
    // new Date() parses "YYYY-MM-DDTHH:MM" as local time.
    const localDate = new Date(localInputString);
    if (isNaN(localDate.getTime())) return null; // Invalid date

    // Get the epoch milliseconds of this localDate. This value represents the true UTC equivalent.
    // For example, if localInputString is "2024-08-01T10:00" and browser is WIB (UTC+7),
    // localDate represents 10:00 WIB, which is 03:00 UTC. localDate.getTime() gives millis for 03:00 UTC.

    // Subtract 7 hours (in milliseconds) from this true UTC time.
    const SEVEN_HOURS_IN_MS = 7 * 60 * 60 * 1000;
    const compensatedEpochMs = localDate.getTime() - SEVEN_HOURS_IN_MS;
    
    // Create a new Date object from the compensated epoch milliseconds.
    const compensatedDate = new Date(compensatedEpochMs);
    
    // Convert the compensated date to an ISO string.
    // If original was 03:00 UTC, compensatedDate is (prev day) 20:00 UTC.
    // .toISOString() will return "YYYY-MM-(DD-1)T20:00:00.000Z".
    return compensatedDate.toISOString();
  } catch (e) {
    console.error("Error formatting local input string to compensated UTC ISO:", localInputString, e);
    return null;
  }
};


// Helper function to format ISO date string to a readable format "Hari, DD MMMM YYYY, HH:MM" in WIB
export const formatDateTimeReadable = (isoString: string | null): string => {
  const date = parseServerWibStringToDate(isoString);
  if (!date) {
    return isoString ? "Format waktu tidak valid" : "Belum ditentukan";
  }

  try {
    // Date part like "Selasa, 30 Juli 2024"
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta', // Format in WIB
    };
    const formattedDatePart = new Intl.DateTimeFormat('id-ID', dateOptions).format(date);

    // Time part like "10:00"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Ensure 24-hour format
      timeZone: 'Asia/Jakarta', // Format in WIB
    };
    // Intl.DateTimeFormat for 'id-ID' and time typically gives 'HH.MM', replace '.' with ':'
    const formattedTimePart = new Intl.DateTimeFormat('id-ID', timeOptions).format(date).replace('.', ':');

    return `${formattedDatePart}, ${formattedTimePart}`;

  } catch (e) {
    // This catch block might be less likely to be hit if parseServerWibStringToDate already validated the date object
    console.error("Error formatting date-time readable (Intl part):", isoString, e);
    return "Format waktu tidak valid";
  }
};

/**
 * Converts a month number (1-12) to its Roman numeral representation.
 * @param month The month number (1 for January, 12 for December).
 * @returns The Roman numeral string for the month.
 */
export const getRomanMonth = (month: number): string => {
  if (month < 1 || month > 12) {
    throw new Error("Invalid month number. Must be between 1 and 12.");
  }
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[month - 1];
};


export const MOCK_STUDENTS_DATA: Student[] = [
  { id: 1, nis: "1001", name: "Ahmad Dahlan", jurusan: Jurusan.MIPA, birthday: "2005-01-15T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 2, nis: "1002", name: "Siti Aminah", jurusan: Jurusan.IPS, birthday: "2005-03-22T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 3, nis: "1003", name: "Budi Santoso", jurusan: Jurusan.BB, birthday: "2005-07-01T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Limpung", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.TidakLulus },
  { id: 4, nis: "1004", name: "Cut Nyak Dien", jurusan: Jurusan.AGM, birthday: "2005-02-10T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 5, nis: "1005", name: "Eko Prasetyo", jurusan: Jurusan.MIPA, birthday: "2005-09-05T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Subah", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 6, nis: "1006", name: "Fitriani Hasanah", jurusan: Jurusan.IPS, birthday: "2005-11-12T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.TidakLulus },
  { id: 7, nis: "1007", name: "Gatot Subroto", jurusan: Jurusan.MIPA, birthday: "2005-04-18T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Gringsing", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 8, nis: "1008", name: "Halimah Tusadiyah", jurusan: Jurusan.AGM, birthday: "2005-06-25T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 9, nis: "1009", name: "Indra Kusuma", jurusan: Jurusan.BB, birthday: "2005-08-30T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Tersono", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
  { id: 10, nis: "1010", name: "Joko Widodo", jurusan: Jurusan.IPS, birthday: "2005-12-07T00:00:00.000Z", school: "MA NU 01 Banyuputih", regency: "Banyuputih", province: "Jawa Tengah", status_kelulusan: StatusKelulusan.Lulus },
];
