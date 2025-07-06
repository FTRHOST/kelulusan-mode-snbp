
import React, { useState, useEffect } from 'react';
import { type Student, Jurusan, StatusKelulusan } from '@/lib/types.ts';
import { CloseIcon } from './icons.tsx';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: Omit<Student, 'id'> | Student) => Promise<void>; // onSubmit is now async
  initialData: Student | null;
  isSubmitting: boolean;
  formError: string | null;
}

// Omit 'id' for new student, but keep other fields, matching Student type (nullable for some)
type StudentFormData = Omit<Student, 'id'>;


const defaultStudentData: StudentFormData = {
  nis: '',
  name: '', 
  jurusan: null, // Default to null for new form for jurusan
  birthday: null, 
  school: null, 
  regency: null, 
  province: null, 
  status_kelulusan: StatusKelulusan.TidakLulus, // Default status
};

const StudentFormModal: React.FC<StudentFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData,
    isSubmitting,
    formError 
}) => {
  const [formState, setFormState] = useState(() => {
    const baseData = initialData ? { ...initialData } : { ...defaultStudentData };
    return {
      ...baseData,
      birthday: initialData?.birthday ? initialData.birthday.split('T')[0] : '', // For date input
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormState({
          ...initialData,
          birthday: initialData.birthday ? initialData.birthday.split('T')[0] : '',
        });
      } else {
        setFormState({
            ...defaultStudentData,
            birthday: '', // Ensure birthday is empty string for new form
        });
      }
      setErrors({}); // Clear validation errors when modal opens/initialData changes
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number | Jurusan | null = value;
    if (name === 'status_kelulusan') {
        processedValue = parseInt(value, 10) as StatusKelulusan;
    } else if (name === 'jurusan') {
        processedValue = value === "" ? null : value as Jurusan;
    }

    setFormState(prev => ({ 
        ...prev, 
        [name]: processedValue
    }));

    if (errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formState.nis.trim()) newErrors.nis = 'NIS tidak boleh kosong.';
    if (!formState.name.trim()) newErrors.name = 'Nama tidak boleh kosong.';
    
    if (formState.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(formState.birthday)) {
        newErrors.birthday = 'Format tanggal lahir tidak valid (YYYY-MM-DD).';
    } else if (formState.birthday && new Date(formState.birthday) > new Date()) {
        newErrors.birthday = 'Tanggal lahir tidak boleh di masa depan.';
    }
    
    if (formState.status_kelulusan !== StatusKelulusan.Lulus && formState.status_kelulusan !== StatusKelulusan.TidakLulus) {
        newErrors.status_kelulusan = 'Status kelulusan tidak valid.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    // Prepare data for submission, aligning with the main Student type
    const submissionData: Omit<Student, 'id'> = {
      nis: formState.nis.trim(),
      name: formState.name.trim(),
      jurusan: formState.jurusan, // Already Jurusan | null
      birthday: formState.birthday ? new Date(formState.birthday).toISOString() : null,
      school: formState.school?.trim() || null, 
      regency: formState.regency?.trim() || null, 
      province: formState.province?.trim() || null,
      status_kelulusan: formState.status_kelulusan,
    };
    
    if (initialData && initialData.id) { 
         await onSubmit({ ...submissionData, id: initialData.id });
    } else { 
         await onSubmit(submissionData);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" 
         aria-modal="true" role="dialog"
         onClick={isSubmitting ? undefined : onClose} // Prevent closing when submitting
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {initialData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <button onClick={isSubmitting ? undefined : onClose} className="text-gray-400 hover:text-gray-600 disabled:opacity-50" disabled={isSubmitting}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            <p className="font-medium">Gagal Menyimpan:</p>
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nis" className={labelClass}>NIS</label>
            <input type="text" name="nis" id="nis" value={formState.nis} onChange={handleChange} className={`${inputClass} ${errors.nis ? 'border-red-500' : ''}`} required disabled={isSubmitting} />
            {errors.nis && <p className="text-xs text-red-500 mt-1">{errors.nis}</p>}
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>Nama Lengkap</label>
            <input type="text" name="name" id="name" value={formState.name} onChange={handleChange} className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`} required disabled={isSubmitting} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="jurusan" className={labelClass}>Jurusan</label>
            <select name="jurusan" id="jurusan" value={formState.jurusan === null ? "" : formState.jurusan} onChange={handleChange} className={inputClass} disabled={isSubmitting}>
              <option value="">Pilih Jurusan (Opsional)</option>
              {Object.values(Jurusan).map(jur => (
                <option key={jur} value={jur}>{jur}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="birthday" className={labelClass}>Tanggal Lahir</label>
            <input type="date" name="birthday" id="birthday" value={formState.birthday || ''} onChange={handleChange} className={`${inputClass} ${errors.birthday ? 'border-red-500' : ''}`} disabled={isSubmitting} />
            {errors.birthday && <p className="text-xs text-red-500 mt-1">{errors.birthday}</p>}
          </div>
          <div>
            <label htmlFor="school" className={labelClass}>Sekolah</label>
            <input type="text" name="school" id="school" value={formState.school || ''} onChange={handleChange} className={`${inputClass} ${errors.school ? 'border-red-500' : ''}`} disabled={isSubmitting} />
            {errors.school && <p className="text-xs text-red-500 mt-1">{errors.school}</p>}
          </div>
          <div>
            <label htmlFor="regency" className={labelClass}>Daerah</label>
            <input type="text" name="regency" id="regency" value={formState.regency || ''} onChange={handleChange} className={`${inputClass} ${errors.regency ? 'border-red-500' : ''}`} disabled={isSubmitting} />
            {errors.regency && <p className="text-xs text-red-500 mt-1">{errors.regency}</p>}
          </div>
          <div>
            <label htmlFor="province" className={labelClass}>Provinsi</label>
            <input type="text" name="province" id="province" value={formState.province || ''} onChange={handleChange} className={`${inputClass} ${errors.province ? 'border-red-500' : ''}`} disabled={isSubmitting} />
            {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
          </div>
          <div>
            <label htmlFor="status_kelulusan" className={labelClass}>Status Kelulusan</label>
            <select name="status_kelulusan" id="status_kelulusan" value={formState.status_kelulusan} onChange={handleChange} className={`${inputClass} ${errors.status_kelulusan ? 'border-red-500' : ''}`} required disabled={isSubmitting}>
              <option value={StatusKelulusan.Lulus}>Lulus</option>
              <option value={StatusKelulusan.TidakLulus}>Tidak Lulus</option>
            </select>
             {errors.status_kelulusan && <p className="text-xs text-red-500 mt-1">{errors.status_kelulusan}</p>}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:bg-brand-primary/70 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
