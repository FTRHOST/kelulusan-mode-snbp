
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Student, StatusKelulusan } from '../types.ts';
import { getRomanMonth, getApiBaseUrl } from '../constants.ts';

// Ensure API_KEY is available in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY environment variable is not set. SKL Generation will fail.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateSKLPrompt = (student: Student): string => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthRoman = getRomanMonth(currentDate.getMonth() + 1);
  const schoolYear = `${currentYear - 1}/${currentYear}`; // Example, can be made configurable

  const kopSurat = `
KEMENTERIAN AGAMA KABUPATEN BATANG
MADRASAH ALIYAH NU 01 BANYUPUTIH
STATUS TERAKREDITASI A (UNGGUL)
Jl. Lapangan Sepak Bola Banyuputih, Kabupaten Batang Jawa Tengah 51271
Telepon: (0285) 668xxx Faks: (0285) 668xxx Website: www.manubanyuputih.sch.id Email: manu01banyuputih@gmail.com
`;

  const kepalaSekolah = "H. Mukhsin, S.Ag., M.Pd.I"; // Replace with actual name
  const nipKepalaSekolah = "197001012000031002"; // Replace with actual NIP

  let title = "SURAT KETERANGAN LULUS";
  let statement = `dinyatakan LULUS dari Satuan Pendidikan MA NU 01 Banyuputih Tahun Pelajaran ${schoolYear} berdasarkan hasil keputusan rapat Dewan Guru tentang penetapan kelulusan siswa MA NU 01 Banyuputih tanggal ${currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
  
  if (student.status_kelulusan !== StatusKelulusan.Lulus) {
    title = "SURAT KETERANGAN HASIL UJIAN";
    statement = `dinyatakan BELUM MEMENUHI KRITERIA KELULUSAN dari Satuan Pendidikan MA NU 01 Banyuputih Tahun Pelajaran ${schoolYear} dan akan mengikuti ujian perbaikan sesuai jadwal yang ditentukan.`;
  }
  
  const studentBirthday = student.birthday ? new Date(student.birthday).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'Data tidak tersedia';


  return `
Buatkan dokumen surat keterangan resmi dalam Bahasa Indonesia yang formal dan baku, berdasarkan detail berikut. Pastikan semua bagian terisi dengan benar dan tata letak sesuai standar surat resmi.

${kopSurat}
==================================================================================================
                                    ${title}
                                  Nomor: 421.3/ ${student.nis}/${currentMonthRoman}/${currentYear}

Yang bertanda tangan di bawah ini, Kepala Madrasah Aliyah NU 01 Banyuputih, Kabupaten Batang, Provinsi Jawa Tengah, menerangkan bahwa:

Nama Lengkap               : ${student.name}
Nomor Induk Siswa (NIS)    : ${student.nis}
Tempat, Tanggal Lahir      : ${studentBirthday}
Sekolah Asal               : ${student.school || 'MA NU 01 Banyuputih'}
Program Keahlian / Jurusan : ${student.jurusan || 'Tidak Ada Jurusan'}

Berdasarkan kriteria kelulusan dan hasil ujian yang telah dilaksanakan, siswa tersebut di atas ${statement}

Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya. Apabila terdapat kekeliruan dalam surat keterangan ini akan diadakan perbaikan sebagaimana mestinya.

                                                                    Banyuputih, ${currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    Kepala Madrasah,

                                                                    [Area untuk TTD dan Stempel Sekolah]
                                                                    [Area untuk TTD dan Stempel Sekolah]
                                                                    [Area untuk TTD dan Stempel Sekolah]

                                                                    ${kepalaSekolah}
                                                                    NIP. ${nipKepalaSekolah}
`;
};

export const generateSklContent = async (student: Student): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key untuk Gemini tidak dikonfigurasi. Tidak dapat menghasilkan konten SKL.");
  }
  
  const prompt = generateSKLPrompt(student);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Correct and current model
        contents: prompt,
    });
    
    // Correctly access the text output
    const sklText = response.text;
    if (!sklText) {
        throw new Error("Gagal mendapatkan konten teks dari Gemini.");
    }
    return sklText;

  } catch (error) {
    console.error("Error generating SKL content with Gemini:", error);
    if (error instanceof Error) {
      // Check for specific Gemini API errors if possible, or rethrow generic
       throw new Error(`Gagal menghasilkan konten SKL: ${error.message}`);
    }
    throw new Error("Terjadi kesalahan tidak diketahui saat menghasilkan konten SKL.");
  }
};


/**
 * Conceptual function to save SKL record.
 * In a real application, this would make an API call to a backend endpoint.
 * @param studentId The ID of the student.
 * @param sklContent The generated SKL content.
 * @returns A promise that resolves when the operation is (conceptually) complete.
 */
export const saveSklRecordToDatabase = async (studentId: number, sklContent: string): Promise<{ success: boolean; message: string }> => {
  console.log("Simulating saving SKL record to database for student ID:", studentId);
  console.log("SKL Content:", sklContent.substring(0, 200) + "..."); // Log a snippet

  // This is a placeholder. Replace with actual API call.
  // Example:
  // const endpoint = `${getApiBaseUrl()}/api/skl_records`;
  // try {
  //   const response = await fetch(endpoint, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ student_id: studentId, content: sklContent, generated_at: new Date().toISOString() })
  //   });
  //   if (!response.ok) {
  //     const errorData = await response.json().catch(() => ({}));
  //     throw new Error(errorData.message || `Failed to save SKL record. Status: ${response.status}`);
  //   }
  //   return { success: true, message: "Catatan SKL berhasil disimpan ke database (simulasi)." };
  // } catch (error) {
  //   console.error("Error saving SKL record (simulation):", error);
  //   return { success: false, message: error instanceof Error ? error.message : "Gagal menyimpan catatan SKL (simulasi)." };
  // }

  // Simulate a delay and success/failure
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random success/failure for demonstration
      // const success = Math.random() > 0.3; 
      const success = true; // For now, always succeed
      if (success) {
        resolve({ success: true, message: "Catatan SKL berhasil disimpan ke database (simulasi berhasil)." });
      } else {
        resolve({ success: false, message: "Gagal menyimpan catatan SKL ke database (simulasi gagal)." });
      }
    }, 1500);
  });
};
