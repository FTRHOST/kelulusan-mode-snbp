
import React, { useState, useEffect } from 'react';
import { type Student, StatusKelulusan } from '@/lib/types.ts';
import { SearchIcon, CheckCircleIcon, XCircleIcon, DownloadIcon } from './icons.tsx';
import Card from './Card.tsx';
import { generateSklContent, saveSklRecordToDatabase } from '../services/sklService.ts';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';

interface SKLGeneratorPageProps {
  students: Student[];
}

const AnimatedSection: React.FC<{children: React.ReactNode, className?: string, delay?: string}> = ({ children, className, delay = 'duration-700' }) => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  return (
    <div
      ref={ref}
      className={`${className || ''} transition-all ${delay} ease-out ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {children}
    </div>
  );
};

const SKLGeneratorPage: React.FC<SKLGeneratorPageProps> = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [generatedSklContent, setGeneratedSklContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // Reset state if students prop changes (e.g., initial load or update)
    setSelectedStudent(null);
    setGeneratedSklContent('');
    setGenerationError(null);
    setSaveStatus(null);
  }, [students]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.nis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setGeneratedSklContent(''); // Clear previous content
    setGenerationError(null);
    setSaveStatus(null);
  };

  const handleGenerateSkl = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    setGenerationError(null);
    setSaveStatus(null);
    try {
      const content = await generateSklContent(selectedStudent);
      setGeneratedSklContent(content);
    } catch (error) {
      console.error("Error generating SKL:", error);
      setGenerationError(error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!generatedSklContent) return;
    const blob = new Blob([generatedSklContent], { type: 'text/plain;charset=utf-8;' });
    const studentNameSafe = selectedStudent?.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'skl';
    const nisSafe = selectedStudent?.nis || '000';
    const fileName = `SKL_${studentNameSafe}_${nisSafe}.txt`;
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("Download tidak didukung oleh browser Anda.");
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedSklContent) return;
    navigator.clipboard.writeText(generatedSklContent).then(() => {
      alert('Konten SKL berhasil disalin ke clipboard!');
    }).catch(err => {
      console.error('Gagal menyalin konten: ', err);
      alert('Gagal menyalin konten. Silakan salin secara manual.');
    });
  };
  
  const handleSaveToDatabase = async () => {
    if (!selectedStudent || !generatedSklContent) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const result = await saveSklRecordToDatabase(selectedStudent.id, generatedSklContent);
      setSaveStatus({ type: result.success ? 'success' : 'error', message: result.message });
    } catch (error) { // Should be caught by service, but as a fallback
      setSaveStatus({ type: 'error', message: error instanceof Error ? error.message : "Kesalahan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };


  const primaryButtonClass = "px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 flex items-center justify-center";
  const secondaryButtonClass = "px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 flex items-center justify-center";


  return (
    <div className="space-y-6">
      <AnimatedSection>
        <h1 className="text-2xl font-semibold text-text-primary">SKL Generator (Tahap Pengembangan)</h1>
        <p className="text-text-secondary mt-1">Buat Surat Keterangan Lulus (SKL) secara otomatis untuk siswa.</p>
      </AnimatedSection>

      {/* Student Selection */}
      <AnimatedSection delay="duration-900">
        <Card title="1. Pilih Siswa">
          <div className="mb-4 relative">
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
          </div>
          {filteredStudents.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <li key={student.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedStudent?.id === student.id ? 'bg-blue-50' : ''}`} onClick={() => handleSelectStudent(student)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text-primary">{student.name}</p>
                        <p className="text-xs text-text-secondary">NIS: {student.nis} - Jurusan: {student.jurusan || '-'}</p>
                      </div>
                      {selectedStudent?.id === student.id && <CheckCircleIcon className="w-5 h-5 text-brand-primary"/>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-text-secondary py-4">
              {students.length === 0 ? 'Tidak ada data siswa.' : 'Tidak ada siswa yang cocok dengan pencarian Anda.'}
            </p>
          )}
        </Card>
      </AnimatedSection>

      {/* Selected Student & Generate Button */}
      {selectedStudent && (
        <AnimatedSection delay="duration-1000">
          <Card title="2. Konfirmasi Siswa & Buat SKL">
            <div className="space-y-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-semibold text-brand-primary">{selectedStudent.name}</h3>
              <p><span className="font-medium">NIS:</span> {selectedStudent.nis}</p>
              <p><span className="font-medium">Jurusan:</span> {selectedStudent.jurusan || 'Tidak ada'}</p>
              <p><span className="font-medium">Status Kelulusan:</span> {selectedStudent.status_kelulusan === StatusKelulusan.Lulus ? 
                <span className="font-semibold text-green-600">LULUS</span> : 
                <span className="font-semibold text-red-600">TIDAK LULUS</span>}
              </p>
            </div>
            <button
              onClick={handleGenerateSkl}
              disabled={isGenerating}
              className={`${primaryButtonClass} w-full`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Membuat Konten SKL...
                </>
              ) : `Buat Konten SKL untuk ${selectedStudent.status_kelulusan === StatusKelulusan.Lulus ? 'Kelulusan' : 'Hasil Ujian'}`}
            </button>
            {generationError && (
              <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                <p className="font-medium">Gagal Membuat SKL:</p>
                <p>{generationError}</p>
              </div>
            )}
          </Card>
        </AnimatedSection>
      )}

      {/* SKL Content Editor & Actions */}
      {generatedSklContent && !isGenerating && (
        <AnimatedSection delay="duration-1100">
          <Card title="3. Tinjau & Kelola SKL">
            <textarea
              value={generatedSklContent}
              onChange={(e) => setGeneratedSklContent(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm font-mono"
              aria-label="Konten SKL yang Dihasilkan"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleDownloadTxt} className={`${secondaryButtonClass}`}>
                <DownloadIcon className="w-5 h-5 mr-2" />
                Unduh sebagai .txt
              </button>
              <button onClick={handleCopyToClipboard} className={`${secondaryButtonClass}`}>
                Salin Konten
              </button>
              <button 
                onClick={handleSaveToDatabase} 
                disabled={isSaving}
                className={`${primaryButtonClass}`}
              >
                {isSaving ? (
                     <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                    </>
                ) : "Simpan Catatan SKL ke Database (Simulasi)"}
              </button>
            </div>
             {saveStatus && (
              <div className={`mt-3 p-3 rounded-md text-sm flex items-start space-x-2 ${saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {saveStatus.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mt-0.5 shrink-0" /> : <XCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />}
                <div><span className="font-medium">Status Simpan:</span> {saveStatus.message}</div>
              </div>
            )}
          </Card>
        </AnimatedSection>
      )}
    </div>
  );
};

export default SKLGeneratorPage;
