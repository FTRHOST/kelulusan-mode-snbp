import React, { useState } from 'react';
import { type Student, StatusKelulusan, Jurusan } from '@/lib/types.ts';
import { PlusIcon, UploadIcon, DownloadIcon, EditIcon, TrashIcon, SearchIcon } from './icons.tsx';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';
import StudentFormModal from './StudentFormModal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { addStudent, updateStudent, deleteStudent } from '../services/studentService.ts';
import Papa from 'papaparse';

interface DataSiswaPageProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const formatDate = (isoDate: string | null | undefined) => {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", isoDate, error);
    return 'Invalid Date';
  }
};

const getStatusBadge = (status: StatusKelulusan) => {
  if (status === StatusKelulusan.Lulus) {
    return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Lulus</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Tidak Lulus</span>;
};

const AnimatedSection: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  return (
    <div
      ref={ref}
      className={`${className || ''} transition-all duration-700 ease-out ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  );
};


const DataSiswaPage: React.FC<DataSiswaPageProps> = ({ students, setStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);


  const handleAddSiswa = () => {
    setStudentToEdit(null);
    setFormError(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setStudentToEdit(null);
    setFormError(null);
  };

  const handleModalSubmit = async (studentDataFromForm: Omit<Student, 'id'> | Student) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if ('id' in studentDataFromForm && studentDataFromForm.id) { 
        // Editing existing student
        const { id, nis: studentNis, ...payloadFields } = studentDataFromForm;
        
        // Ensure payloadFields conforms to Omit<Student, 'id' | 'nis'>
        // It should contain: name, jurusan, birthday, school, regency, province, status_kelulusan
        const dataForApiBody: Omit<Student, 'id' | 'nis'> = {
            name: payloadFields.name,
            jurusan: payloadFields.jurusan,
            birthday: payloadFields.birthday,
            school: payloadFields.school,
            regency: payloadFields.regency,
            province: payloadFields.province,
            status_kelulusan: payloadFields.status_kelulusan,
        };

        const updatedStudent = await updateStudent(studentNis, dataForApiBody, id);
        setStudents(prevStudents => 
          prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        );
        console.log("Student updated:", updatedStudent);
      } else { 
        // Adding new student
        const newStudent = await addStudent(studentDataFromForm as Omit<Student, 'id'>);
        setStudents(prevStudents => [...prevStudents, newStudent]);
        console.log("Student added:", newStudent);
      }
      handleModalClose();
    } catch (error) {
        console.error("Error submitting student data:", error);
        if (error instanceof Error) {
            setFormError(error.message || "Gagal menyimpan data siswa.");
        } else {
            setFormError("Terjadi kesalahan yang tidak diketahui saat menyimpan data.");
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteError(null);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteStudent(studentToDelete.nis);
      setStudents(prevStudents => prevStudents.filter(s => s.id !== studentToDelete.id));
      console.log("Student deleted:", studentToDelete.nis);
      setIsConfirmModalOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      if (error instanceof Error) {
        setDeleteError(error.message || "Gagal menghapus siswa.");
      } else {
        setDeleteError("Terjadi kesalahan yang tidak diketahui saat menghapus siswa.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = () => {
    if (isImporting) return;
    setImportStatusMessage(null);
    setImportError(null);
    document.getElementById('import-file-input')?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }

    setIsImporting(true);
    setImportStatusMessage("Memproses file impor...");
    setImportError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let errorCount = 0;
        const errorDetails: string[] = [];

        if (results.errors.length > 0) {
            results.errors.forEach(err => {
                 errorDetails.push(`Baris ${err.row}: ${err.message} (${err.code})`);
            });
        }
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          setImportStatusMessage(`Memproses baris ${i + 1} dari ${rows.length}...`);
          
          const nis = row.NIS?.trim();
          const name = row.Nama?.trim();
          
          if (!nis || !name) {
            errorCount++;
            errorDetails.push(`Baris ${i + 2}: NIS dan Nama wajib diisi.`); // i+2 because header is 1st row, data starts at 2nd
            continue;
          }

          let birthday = null;
          if (row.TanggalLahir && row.TanggalLahir.trim() !== '') {
            const dateParts = row.TanggalLahir.split('-'); // Expect YYYY-MM-DD
            // Basic validation for YYYY-MM-DD, more robust parsing could be added
            if (dateParts.length === 3 && !isNaN(new Date(row.TanggalLahir.trim()).getTime())) {
                // Ensure it's a valid date before converting to ISO string
                 try {
                    birthday = new Date(row.TanggalLahir.trim()).toISOString();
                 } catch (e) {
                    errorCount++;
                    errorDetails.push(`Baris ${i + 2} (NIS: ${nis}): Format TanggalLahir tidak valid "${row.TanggalLahir}". Gunakan YYYY-MM-DD.`);
                    continue;
                 }
            } else {
                 errorCount++;
                 errorDetails.push(`Baris ${i + 2} (NIS: ${nis}): Format TanggalLahir tidak valid "${row.TanggalLahir}". Gunakan YYYY-MM-DD.`);
                 continue;
            }
          }
          
          const statusKelulusanValue = row.StatusKelulusan?.trim();
          let status_kelulusan: StatusKelulusan;
          if (statusKelulusanValue === "1" || statusKelulusanValue?.toLowerCase() === "lulus") {
            status_kelulusan = StatusKelulusan.Lulus;
          } else if (statusKelulusanValue === "0" || statusKelulusanValue?.toLowerCase() === "tidak lulus") {
            status_kelulusan = StatusKelulusan.TidakLulus;
          } else {
            errorCount++;
            errorDetails.push(`Baris ${i + 2} (NIS: ${nis}): StatusKelulusan tidak valid "${statusKelulusanValue}". Gunakan 0 (Tidak Lulus) atau 1 (Lulus).`);
            continue;
          }

          const jurusanValue = row.Jurusan?.trim();
          let jurusan: Jurusan | null = null;
          if (jurusanValue && Object.values(Jurusan).includes(jurusanValue as Jurusan)) {
            jurusan = jurusanValue as Jurusan;
          } else if (jurusanValue && jurusanValue !== '') { // If there's a value but it's not a valid Jurusan
             errorCount++;
             errorDetails.push(`Baris ${i + 2} (NIS: ${nis}): Jurusan tidak valid "${jurusanValue}". Pilih dari: ${Object.values(Jurusan).join(', ')} atau kosongkan.`);
             continue;
          }

          const studentData: Omit<Student, 'id'> = {
            nis,
            name,
            jurusan,
            birthday,
            school: row.Sekolah?.trim() || null,
            regency: row.Daerah?.trim() || null,
            province: row.Provinsi?.trim() || null,
            status_kelulusan,
          };

          try {
            const newStudent = await addStudent(studentData);
            setStudents(prev => [...prev, newStudent]);
            successCount++;
          } catch (err) {
            errorCount++;
            const errorMessage = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
            errorDetails.push(`Baris ${i + 2} (NIS: ${nis}): Gagal impor - ${errorMessage}`);
          }
        }

        let finalMessage = `${successCount} siswa berhasil diimpor.`;
        if (errorCount > 0) {
          finalMessage += ` ${errorCount} siswa gagal diimpor.`;
          setImportError(`Detail kesalahan:\n${errorDetails.slice(0, 10).join('\n')}${errorDetails.length > 10 ? '\n... (dan kesalahan lainnya)' : ''}`);
        } else if (successCount === 0 && rows.length > 0){
            finalMessage = "Tidak ada siswa yang berhasil diimpor dari file.";
             if(errorDetails.length === 0) errorDetails.push("Pastikan file CSV memiliki data dan format yang benar sesuai template.");
            setImportError(`Detail kesalahan:\n${errorDetails.slice(0,10).join('\n')}`);
        } else if (rows.length === 0) {
            finalMessage = "File CSV kosong atau tidak ada data untuk diimpor.";
        }


        setImportStatusMessage(finalMessage);
        setIsImporting(false);
      },
      error: (error: Error) => {
        console.error("Error parsing CSV:", error);
        setImportError(`Gagal mem-parsing file CSV: ${error.message}`);
        setIsImporting(false);
      }
    });
    event.target.value = ''; 
  };

  const handleDownloadTemplate = () => {
    const headers = "NIS,Nama,Jurusan,TanggalLahir,Sekolah,Daerah,Provinsi,StatusKelulusan";
    const exampleJurusan = Jurusan.MIPA; 
    const exampleStatus = "1"; // "1" for Lulus as per template guide
    const exampleRow = `1001,John Doe,"${exampleJurusan}",2005-08-15,SMAN 1 Example,Example City,Example Province,${exampleStatus}`;

    const csvContent = `${headers}\n${exampleRow}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "template_import_siswa.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("Download template tidak didukung browser Anda.");
    }
  };
  

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatedSection className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-text-primary mb-4 sm:mb-0">Data Siswa</h1>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleAddSiswa}
            disabled={isImporting}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Tambah Siswa
          </button>
          <button 
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
          >
            {isImporting ? (
                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : <UploadIcon className="w-5 h-5 mr-2" />}
            {isImporting ? 'Mengimpor...' : 'Import Siswa'}
          </button>
          <input type="file" id="import-file-input" className="hidden" accept=".csv" onChange={handleFileChange} disabled={isImporting} />
          <button 
            onClick={handleDownloadTemplate}
            disabled={isImporting}
            className="flex items-center px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download Template
          </button>
        </div>
      </AnimatedSection>
      
      {importStatusMessage && (
        <AnimatedSection>
          <div className={`p-3 rounded-md text-sm ${importError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <p className="font-medium">{importError ? 'Hasil Impor (dengan kesalahan):' : 'Hasil Impor:'}</p>
            <p>{importStatusMessage}</p>
            {importError && <pre className="mt-2 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto bg-red-50 p-2 rounded">{importError}</pre>}
          </div>
        </AnimatedSection>
      )}


      <AnimatedSection className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="w-5 h-5 text-gray-400" />
        </span>
        <input
            type="text"
            placeholder="Cari siswa berdasarkan Nama atau NIS..."
            className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </AnimatedSection>

      <AnimatedSection className="bg-card-bg rounded-xl shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3 w-12 text-center">No.</th>
              <th scope="col" className="px-4 py-3">NIS/Nomor Unik</th>
              <th scope="col" className="px-4 py-3">Nama Siswa</th>
              <th scope="col" className="px-4 py-3">Jurusan</th>
              <th scope="col" className="px-4 py-3">Tgl Lahir</th>
              <th scope="col" className="px-4 py-3 text-center">Status</th>
              <th scope="col" className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={student.id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student.nis}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.jurusan || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(student.birthday)}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(student.status_kelulusan)}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button
                      onClick={() => handleEdit(student)}
                      disabled={isImporting}
                      className="text-brand-primary hover:text-blue-700 p-1 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                      aria-label={`Edit ${student.name}`}
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      disabled={isImporting}
                      className="text-danger hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                      aria-label={`Hapus ${student.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  {students.length === 0 && !searchTerm ? 'Tidak ada data siswa.' : 'Tidak ada siswa yang cocok dengan pencarian Anda.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AnimatedSection>
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={studentToEdit}
        isSubmitting={isSubmitting}
        formError={formError}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa "${studentToDelete?.name}" (NIS: ${studentToDelete?.nis})? Tindakan ini tidak dapat dibatalkan.`}
        confirmButtonText="Ya, Hapus"
        cancelButtonText="Batal"
        isConfirming={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default DataSiswaPage;