
export enum Jurusan {
    MIPA = "Matematika dan Ilmu Pengetahuan Alam (MIPA)",
    IPS = "Ilmu Pengetahuan Sosial (IPS)",
    BB = "Bahasa (BB)",
    AGM = "Keagamaan (Agm)",
  }
  
  export enum StatusKelulusan {
    TidakLulus = 0,
    Lulus = 1,
  }
  
  export interface Student {
    id: number;
    nis: string;
    name: string; // Changed from nama
    jurusan: Jurusan | null; // Changed to allow null
    birthday: string | null; // Changed from tanggalLahir, allow null
    school: string | null; // Changed from sekolah, allow null
    regency: string | null; // Changed from daerah, allow null
    province: string | null; // Changed from provinsi, allow null
    status_kelulusan: StatusKelulusan;
    // created_at from API is not included for now unless needed
  }
  
  export interface IconProps {
    className?: string;
  }