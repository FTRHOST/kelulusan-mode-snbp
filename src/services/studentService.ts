
import { type Student, Jurusan, StatusKelulusan } from '@/lib/types.ts';
import { getApiEndpointSiswa, getApiBaseUrl } from '@/lib/constants.ts';

interface ApiStudent {
  id: number;
  nis: string;
  name: string;
  jurusan: string | null; // API returns string name of Jurusan or null
  birthday: string | null; // ISO8601 string or null
  school: string | null;
  regency: string | null;
  province: string | null;
  status_kelulusan: number; // 0 or 1. In some backend responses, this might be named 'status'
  status?: number; // To accommodate backends that might return 'status' instead of 'status_kelulusan'
  created_at?: string; 
  updated_at?: string;
}

interface ApiResponseSingle {
  message: string;
  data: ApiStudent; // For add/update, backend returns the student object
}

interface ApiResponseCollection {
  message: string;
  data: ApiStudent[];
}

// interface ApiResponseDelete { // Specific for delete if backend sends a message - not used if 204
//   message: string;
// }

const mapApiStudentToStudent = (apiStudent: ApiStudent): Student => ({
  id: apiStudent.id,
  nis: apiStudent.nis,
  name: apiStudent.name,
  jurusan: apiStudent.jurusan as Jurusan | null,
  birthday: apiStudent.birthday,
  school: apiStudent.school,
  regency: apiStudent.regency,
  province: apiStudent.province,
  // Handle if backend returns 'status' or 'status_kelulusan'
  status_kelulusan: (apiStudent.status_kelulusan !== undefined ? apiStudent.status_kelulusan : apiStudent.status) as StatusKelulusan,
});

export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const response = await fetch(getApiEndpointSiswa());
    if (!response.ok) {
      let errorMessage = `Gagal mengambil data siswa. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Ignore if error response is not JSON
      }
      throw new Error(errorMessage);
    }
    const jsonData: ApiResponseCollection = await response.json();
    
    return jsonData.data.map(mapApiStudentToStudent);

  } catch (error) {
    console.error("Error in fetchStudents:", error);
    if (error instanceof Error) {
        throw new Error(`Tidak dapat terhubung ke server atau terjadi kesalahan: ${error.message}`);
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat mengambil data siswa.");
  }
};

export const addStudent = async (studentData: Omit<Student, 'id'>): Promise<Student> => {
  try {
    // Defensively ensure nullable fields are null if undefined
    const payload = {
      nis: studentData.nis,
      name: studentData.name,
      jurusan: studentData.jurusan !== undefined ? studentData.jurusan : null,
      birthday: studentData.birthday !== undefined ? studentData.birthday : null,
      school: studentData.school !== undefined ? studentData.school : null,
      regency: studentData.regency !== undefined ? studentData.regency : null,
      province: studentData.province !== undefined ? studentData.province : null,
      status_kelulusan: studentData.status_kelulusan,
    };

    const response = await fetch(getApiEndpointSiswa(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let errorMessage = `Gagal menambahkan siswa. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || (errorData.errors ? JSON.stringify(errorData.errors) : errorMessage);
      } catch (e) {
        // Ignore
      }
      throw new Error(errorMessage);
    }
    const jsonData: ApiResponseSingle = await response.json();
    // Assuming the backend returns the full student object including ID for POST
    return mapApiStudentToStudent(jsonData.data);
  } catch (error) {
    console.error("Error in addStudent:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat menambahkan siswa.");
  }
};

export const updateStudent = async (
    nis: string, 
    dataForApiBody: Omit<Student, 'id' | 'nis'>, 
    originalStudentId: number
): Promise<Student> => {
  
  const incomingStatus = dataForApiBody.status_kelulusan;
  let finalStatusForApi: StatusKelulusan;

  // Robustly determine the status to send to the API
  if (Number(incomingStatus) === StatusKelulusan.Lulus) {
    finalStatusForApi = StatusKelulusan.Lulus;
  } else if (Number(incomingStatus) === StatusKelulusan.TidakLulus) {
    finalStatusForApi = StatusKelulusan.TidakLulus;
  } else {
    // This fallback ensures finalStatusForApi is always 0 or 1.
    console.warn(
      `[updateStudent] NIS: ${nis} - status_kelulusan ('${incomingStatus}', type: ${typeof incomingStatus}) is not a valid numeric 0 or 1. Defaulting to TidakLulus (0).`
    );
    finalStatusForApi = StatusKelulusan.TidakLulus;
  }
  
  // For debugging, log the determined finalStatusForApi
  console.log(`[updateStudent] NIS: ${nis} - Determined finalStatusForApi: ${finalStatusForApi} (Type: ${typeof finalStatusForApi})`);

  const apiPayload = {
    name: dataForApiBody.name,
    jurusan: dataForApiBody.jurusan !== undefined ? dataForApiBody.jurusan : null,
    birthday: dataForApiBody.birthday !== undefined ? dataForApiBody.birthday : null,
    school: dataForApiBody.school !== undefined ? dataForApiBody.school : null,
    regency: dataForApiBody.regency !== undefined ? dataForApiBody.regency : null,
    province: dataForApiBody.province !== undefined ? dataForApiBody.province : null,
    status_kelulusan: finalStatusForApi, // Changed key back to 'status_kelulusan'
  };
  
  // Log the exact payload being sent
  console.log(`[updateStudent] NIS: ${nis} - Sending PUT payload:`, JSON.parse(JSON.stringify(apiPayload)));

  try {
    const response = await fetch(`${getApiEndpointSiswa()}${nis}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      let errorMessage = `Gagal memperbarui siswa. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || (errorData.errors ? JSON.stringify(errorData.errors) : errorMessage);
      } catch (e) { /* Ignore */ }
      throw new Error(errorMessage);
    }

    const jsonData: { message: string, data: ApiStudent } = await response.json(); 
    const responseData = jsonData.data;

    // Ensure the returned student object for frontend state has the correct structure
    return {
      id: originalStudentId, 
      nis: responseData.nis || nis, 
      name: responseData.name,
      jurusan: responseData.jurusan as Jurusan | null,
      birthday: responseData.birthday,
      school: responseData.school,
      regency: responseData.regency,
      province: responseData.province,
      // Use mapApiStudentToStudent's logic for consistency if possible, or directly handle here:
      status_kelulusan: (responseData.status_kelulusan !== undefined ? responseData.status_kelulusan : responseData.status) as StatusKelulusan,
    };

  } catch (error) {
    console.error("Error in updateStudent:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat memperbarui siswa.");
  }
};

export const deleteStudent = async (nis: string): Promise<void> => {
  try {
    const response = await fetch(`${getApiEndpointSiswa()}${nis}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = `Gagal menghapus siswa. Status: ${response.status}`;
      try {
        // Only try to parse JSON if there's content
        if (response.status !== 204 && response.headers.get("content-length") !== "0") {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch (e) {
        // Ignore if error response is not JSON
      }
      if (response.status === 204) { // No Content
        return; 
      }
      throw new Error(errorMessage);
    }
    // Check if there is content before trying to parse (e.g. 200 OK with message)
    if (response.status === 200 && response.headers.get("content-length") !== "0") {
        await response.json(); // Consume if there is a body, like { message: "Student deleted" }
    }
    return; 
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Terjadi kesalahan yang tidak diketahui saat menghapus siswa.");
  }
};


export interface ApiStatus {
  online: boolean;
  message: string;
}

// Modified to accept an optional baseUrl for testing purposes
export const checkApiStatus = async (baseUrlForTest?: string): Promise<ApiStatus> => {
  const targetEndpoint = baseUrlForTest ? `${baseUrlForTest.replace(/\/$/, '')}/api/kelulusan/` : getApiEndpointSiswa();
  try {
    const getResponse = await fetch(targetEndpoint, { signal: AbortSignal.timeout(8000) }); 
     if (getResponse.ok) {
        return { online: true, message: `API terhubung (${targetEndpoint}).` };
    }
    return { online: false, message: `API merespons, tetapi dengan status error: ${getResponse.status} saat mengakses ${targetEndpoint}` };
  } catch (error) {
    console.warn(`Error checking API status for ${targetEndpoint}:`, error);
    let message = `Gagal terhubung ke API (${targetEndpoint}). Periksa koneksi atau status server.`;
    if (error instanceof Error && error.name === 'TimeoutError') {
        message = `Permintaan ke API (${targetEndpoint}) timeout. Server mungkin lambat atau tidak terjangkau.`;
    } else if (error instanceof Error) {
        message = `Gagal terhubung ke API (${targetEndpoint}): ${error.message}`;
    }
    return { online: false, message };
  }
};
