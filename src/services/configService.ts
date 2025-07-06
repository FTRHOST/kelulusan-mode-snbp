import { getApiBaseUrl } from '@/lib/constants.ts';

interface AnnouncementTimeApiResponse {
  message: string;
  data?: { // Optional because 404 might not have data field
    waktu_pengumuman_resmi: string | null;
  };
  error?: string; // For error responses
  waktu_pengumuman: string | null; // For PUT response success
}

export interface WebsiteSettings {
  title: string;
  subtitle: string;
  logoUrl?: string;
}

interface WebsiteSettingsApiResponse {
    message: string;
    data?: WebsiteSettings;
    error?: string;
}


/**
 * Fetches the official announcement open time from the API.
 * GET /api/waktu-pengumuman
 * @returns A promise that resolves to the announcement time string (ISO format) or null if not set/error.
 */
export const fetchApiAnnouncementOpenTime = async (): Promise<string | null> => {
  const endpoint = `${getApiBaseUrl()}/api/waktu-pengumuman`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const jsonData: AnnouncementTimeApiResponse = await response.json();
      return jsonData.data?.waktu_pengumuman_resmi || null;
    } else if (response.status === 404) {
      // console.info("Waktu pengumuman belum diatur di server.");
      return null; // Explicitly return null if not set
    } else {
      let errorMessage = `Gagal mengambil waktu pengumuman. Status: ${response.status}`;
      try {
        const errorData: AnnouncementTimeApiResponse = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Ignore if error response is not JSON
      }
      console.error(errorMessage);
      // Depending on desired behavior, could throw new Error(errorMessage) or return null
      return null; 
    }
  } catch (error) {
    console.error("Error fetching announcement open time:", error);
    if (error instanceof Error) {
        // throw new Error(`Tidak dapat terhubung ke server untuk waktu pengumuman: ${error.message}`);
         return null; // Return null on network error too, to allow app to function
    }
    // throw new Error("Terjadi kesalahan tidak diketahui saat mengambil waktu pengumuman.");
    return null;
  }
};

/**
 * Updates the official announcement open time via the API.
 * PUT /api/waktu-pengumuman
 * @param time The ISO string of the time to set, or null to clear it.
 * @returns A promise that resolves on success or rejects on error.
 */
export const updateApiAnnouncementOpenTime = async (time: string | null): Promise<void> => {
  const endpoint = `${getApiBaseUrl()}/api/waktu-pengumuman`;
  
  // The backend expects 'waktu_pengumuman' in the body.
  // If time is null, it should clear the time on the backend.
  // Backend's `if (!waktu_pengumuman)` check means empty string won't work.
  // So, we send `null` as the value for the `waktu_pengumuman` key.
  const payload = { waktu_pengumuman_resmi: time };

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Gagal memperbarui waktu pengumuman. Status: ${response.status}`;
      try {
        const errorData: AnnouncementTimeApiResponse = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Ignore
      }
      throw new Error(errorMessage);
    }
    // Success, no specific data needed from response for frontend state update,
    // as we will re-fetch or assume success based on HTTP status.
    // const jsonData: AnnouncementTimeApiResponse = await response.json();
    // console.log("Waktu pengumuman berhasil diperbarui:", jsonData);
    return;
  } catch (error) {
    console.error("Error updating announcement open time:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat memperbarui waktu pengumuman.");
  }
};

/**
 * Fetches website settings (title, subtitle) from the API.
 * GET /api/website-settings
 */
export const fetchWebsiteSettings = async (): Promise<WebsiteSettings | null> => {
    const endpoint = `${getApiBaseUrl()}/api/website-settings`;
    try {
        const response = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
        if (response.ok) {
            const jsonData: WebsiteSettingsApiResponse = await response.json();
            return jsonData.data || null;
        }
        if (response.status === 404) {
            return null;
        }
        let errorMessage = `Gagal mengambil pengaturan website. Status: ${response.status}`;
        try {
            const errorData: WebsiteSettingsApiResponse = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) { /* ignore */ }
        throw new Error(errorMessage); // Throw error to be caught by the caller
    } catch (error) {
        console.error("Error fetching website settings:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Terjadi kesalahan yang tidak diketahui saat mengambil pengaturan website.");
    }
};

/**
 * Updates the website settings via the API.
 * PUT /api/website-settings
 */
export const updateWebsiteSettings = async (settings: WebsiteSettings): Promise<void> => {
    const endpoint = `${getApiBaseUrl()}/api/website-settings`;
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(settings),
        });
        if (!response.ok) {
            let errorMessage = `Gagal memperbarui pengaturan website. Status: ${response.status}`;
            try {
                const errorData: WebsiteSettingsApiResponse = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) { /* ignore */ }
            throw new Error(errorMessage);
        }
        return;
    } catch (error) {
        console.error("Error updating website settings:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Terjadi kesalahan yang tidak diketahui saat memperbarui pengaturan website.");
    }
};