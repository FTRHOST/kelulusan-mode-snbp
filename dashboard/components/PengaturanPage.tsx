
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getApiBaseUrl, 
  USER_API_BASE_URL_KEY, 
  DEFAULT_API_BASE_URL,
  parseServerWibStringToDate,
  formatDateToLocalInput,
  formatLocalInputToCompensatedUtcISO, // Changed from formatLocalInputToUtcISO
  formatDateTimeReadable,
} from '../constants.ts';
import { fetchApiAnnouncementOpenTime, updateApiAnnouncementOpenTime } from '../services/configService.ts';
import { checkApiStatus, ApiStatus } from '../services/studentService.ts';
import Card from './Card.tsx';
import { ApiStatusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from './icons.tsx';

const PengaturanPage = (): JSX.Element => {
  // API URL State
  const [apiUrlInput, setApiUrlInput] = useState<string>('');
  const [effectiveApiUrl, setEffectiveApiUrl] = useState<string>('');
  const [testStatus, setTestStatus] = useState<ApiStatus & { loading: boolean } | null>(null);
  const [saveApiStatus, setSaveApiStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Announcement Time State (API driven)
  const [announcementTimeInput, setAnnouncementTimeInput] = useState<string>(''); // For datetime-local input
  const [apiFetchedAnnouncementTime, setApiFetchedAnnouncementTime] = useState<string | null>(null); // Raw string from API
  const [loadingApiAnnouncementTime, setLoadingApiAnnouncementTime] = useState<boolean>(true);
  const [announcementTimeError, setAnnouncementTimeError] = useState<string | null>(null);
  const [saveAnnouncementTimeStatus, setSaveAnnouncementTimeStatus] = useState<{ type: 'success' | 'error'; message: string; isSubmitting?: boolean } | null>(null);
  
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const refreshApiUrlSettings = () => {
    const currentActiveUrl = getApiBaseUrl();
    setEffectiveApiUrl(currentActiveUrl);
    const storedUserUrl = localStorage.getItem(USER_API_BASE_URL_KEY);
    setApiUrlInput(storedUserUrl || currentActiveUrl);
  };

  const loadAnnouncementTimeFromApi = useCallback(async () => {
    setLoadingApiAnnouncementTime(true);
    setAnnouncementTimeError(null);
    try {
      const timeStringFromServer = await fetchApiAnnouncementOpenTime();
      setApiFetchedAnnouncementTime(timeStringFromServer); // Store raw string

      const dateObject = parseServerWibStringToDate(timeStringFromServer); // Parse correctly
      setAnnouncementTimeInput(formatDateToLocalInput(dateObject)); // Format for input

    } catch (error) {
      console.error("PengaturanPage: Failed to fetch announcement time", error);
      const message = error instanceof Error ? error.message : "Gagal memuat waktu pengumuman dari API.";
      setAnnouncementTimeError(message);
      setApiFetchedAnnouncementTime(null);
      setAnnouncementTimeInput('');
    } finally {
      setLoadingApiAnnouncementTime(false);
    }
  }, []);


  useEffect(() => {
    const initializePage = async () => {
      setInitialLoading(true);
      refreshApiUrlSettings();
      await loadAnnouncementTimeFromApi();
      setInitialLoading(false);
    };
    initializePage();
  }, [loadAnnouncementTimeFromApi]);

  const handleSaveApiUrl = () => {
    setSaveApiStatus(null);
    setTestStatus(null);
    if (!apiUrlInput.trim()) {
      setSaveApiStatus({ type: 'error', message: "URL API tidak boleh kosong." });
      return;
    }
    if (!apiUrlInput.startsWith('http://') && !apiUrlInput.startsWith('https://')) {
      setSaveApiStatus({ type: 'error', message: "URL API tidak valid. Harus dimulai dengan http:// atau https://" });
      return;
    }

    try {
      localStorage.setItem(USER_API_BASE_URL_KEY, apiUrlInput.trim());
      refreshApiUrlSettings(); 
      setSaveApiStatus({ type: 'success', message: "Link API berhasil disimpan di penyimpanan lokal peramban Anda." });
    } catch (error) {
      console.error("Error saving API URL to localStorage:", error);
      setSaveApiStatus({ type: 'error', message: "Gagal menyimpan Link API ke penyimpanan lokal." });
    }
  };

  const handleResetApiUrl = () => {
    setSaveApiStatus(null);
    setTestStatus(null);
    try {
      localStorage.removeItem(USER_API_BASE_URL_KEY);
      refreshApiUrlSettings(); 
      setSaveApiStatus({ type: 'success', message: "Link API telah direset ke konfigurasi default (dari config.json atau hardcode)." });
    } catch (error)      {
      console.error("Error resetting API URL from localStorage:", error);
      setSaveApiStatus({ type: 'error', message: "Gagal mereset Link API dari penyimpanan lokal." });
    }
  };

  const handleTestConnection = async () => {
    const urlToTest = apiUrlInput.trim();
    if (!urlToTest) {
      setTestStatus({ online: false, message: "URL API input kosong.", loading: false });
      return;
    }
    setTestStatus({ loading: true, online: false, message: "Menguji koneksi..." });
    const status = await checkApiStatus(urlToTest);
    setTestStatus({ ...status, loading: false });
  };

  const handleSaveAnnouncementTime = async () => {
    setSaveAnnouncementTimeStatus({ message: 'Menyimpan...', type: 'success', isSubmitting: true });
    
    // Convert the local datetime input string to a compensated UTC ISO string for the server
    // This compensates for an API issue where UTC time appears to be shifted by +7 hours.
    const compensatedUtcIsoTime = formatLocalInputToCompensatedUtcISO(announcementTimeInput);

    try {
      await updateApiAnnouncementOpenTime(compensatedUtcIsoTime); 
      setSaveAnnouncementTimeStatus({ 
        type: 'success', 
        message: `Waktu pengumuman berhasil disimpan ke server. ${!compensatedUtcIsoTime ? 'Waktu telah dikosongkan.' : ''}`.trim(),
        isSubmitting: false
      });
      await loadAnnouncementTimeFromApi(); 
    } catch (error) {
      console.error("Error saving announcement time to API:", error);
      const message = error instanceof Error ? error.message : "Gagal menyimpan waktu pengumuman ke server.";
      setSaveAnnouncementTimeStatus({ type: 'error', message, isSubmitting: false });
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100";
  const primaryButtonClass = "px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50";
  const secondaryButtonClass = "px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50";


  if (initialLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">Pengaturan Aplikasi</h1>
        <Card title="Memuat Pengaturan">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            <p className="text-text-secondary">Memuat konfigurasi...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Pengaturan Aplikasi</h1>
      
      <Card title="Konfigurasi Link API">
        <div className="space-y-4">
          <div>
            <label htmlFor="apiUrlInput" className="block text-sm font-medium text-gray-700 mb-1">
              Link API Kustom (disimpan di peramban ini):
            </label>
            <input
              type="url"
              id="apiUrlInput"
              name="apiUrlInput"
              value={apiUrlInput}
              onChange={(e) => {
                setApiUrlInput(e.target.value);
                setSaveApiStatus(null); 
                setTestStatus(null); 
              }}
              placeholder="Contoh: https://api.serveranda.com/"
              className={`${inputClass} ${saveApiStatus?.type === 'error' && !apiUrlInput.trim() ? 'border-red-500' : ''}`}
              aria-describedby="apiUrlInputHelp"
            />
            <p id="apiUrlInputHelp" className="mt-1 text-xs text-gray-500">
              URL ini akan menggantikan konfigurasi API default (dari <code>public/config.json</code>) hanya untuk peramban Anda.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={handleSaveApiUrl} disabled={testStatus?.loading} className={primaryButtonClass}>
              Simpan Link API
            </button>
            <button onClick={handleResetApiUrl} disabled={testStatus?.loading} className={secondaryButtonClass}>
              Reset ke Default API
            </button>
             <button onClick={handleTestConnection} disabled={testStatus?.loading || !apiUrlInput.trim()} className={secondaryButtonClass}>
              {testStatus?.loading ? 'Menguji...' : 'Uji Koneksi Input'}
            </button>
          </div>

          {saveApiStatus && (
            <div className={`mt-3 p-3 rounded-md text-sm flex items-start space-x-2 ${saveApiStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {saveApiStatus.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mt-0.5 shrink-0 text-green-500" /> : <XCircleIcon className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />}
              <div>
                <span className="font-medium">{saveApiStatus.type === 'success' ? 'Berhasil:' : 'Gagal:'}</span> {saveApiStatus.message}
              </div>
            </div>
          )}

          {testStatus && !testStatus.loading && (
            <div className={`mt-3 p-3 rounded-md text-sm flex items-start space-x-2 ${testStatus.online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <ApiStatusIcon online={testStatus.online} className={`w-5 h-5 mt-0.5 shrink-0 ${testStatus.online ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <span className="font-medium">Status Tes Koneksi (dari input): </span> {testStatus.message}
              </div>
            </div>
          )}
          
          <hr className="my-4" />
          <div>
            <label htmlFor="effectiveApiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Link API yang Sedang Aktif Digunakan:
            </label>
            <input type="text" id="effectiveApiUrl" value={effectiveApiUrl} readOnly className={`${inputClass} bg-gray-50 cursor-default`} />
          </div>
        </div>
      </Card>

      <Card title="Pengaturan Waktu Pengumuman (via API)">
        <div className="space-y-4">
          {loadingApiAnnouncementTime && (
             <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Memuat waktu pengumuman dari server...</span>
            </div>
          )}
          {announcementTimeError && !loadingApiAnnouncementTime &&(
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                Kesalahan: {announcementTimeError}
            </div>
          )}
          {!loadingApiAnnouncementTime && !announcementTimeError && (
            <>
            <div>
                <label htmlFor="announcementTimeInput" className="block text-sm font-medium text-gray-700 mb-1">
                Ubah Waktu Pengumuman (input dalam waktu lokal Anda):
                </label>
                <input
                type="datetime-local"
                id="announcementTimeInput"
                name="announcementTimeInput"
                value={announcementTimeInput}
                onChange={(e) => {
                    setAnnouncementTimeInput(e.target.value);
                    setSaveAnnouncementTimeStatus(null);
                }}
                className={`${inputClass} ${saveAnnouncementTimeStatus?.type === 'error' ? 'border-red-500' : ''}`}
                aria-describedby="announcementTimeHelp"
                disabled={saveAnnouncementTimeStatus?.isSubmitting}
                />
                <p id="announcementTimeHelp" className="mt-1 text-xs text-gray-500">
                  Pilih tanggal dan waktu (dalam zona waktu lokal peramban Anda, Anda dapat memasukkan waktu dalam format 24 jam, misal 14:30). Waktu ini akan dikonversi ke UTC untuk disimpan di server. Tampilan waktu pengumuman resmi akan dalam format WIB (Hari, Tanggal, JJ:MM).
                </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <button 
                    onClick={handleSaveAnnouncementTime} 
                    className={primaryButtonClass}
                    disabled={saveAnnouncementTimeStatus?.isSubmitting || loadingApiAnnouncementTime}
                >
                {saveAnnouncementTimeStatus?.isSubmitting ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Menyimpan...</>
                ) : 'Simpan Waktu ke Server'}
                </button>
            </div>

            {saveAnnouncementTimeStatus && (
                <div className={`mt-3 p-3 rounded-md text-sm flex items-start space-x-2 ${saveAnnouncementTimeStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {saveAnnouncementTimeStatus.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mt-0.5 shrink-0" /> : <XCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />}
                <div>
                    <span className="font-medium">{saveAnnouncementTimeStatus.type === 'success' ? 'Berhasil:' : 'Gagal:'}</span> {saveAnnouncementTimeStatus.message}
                </div>
                </div>
            )}
            </>
          )}
          <hr className="my-4" />
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Waktu Pengumuman Resmi dari Server (WIB):
            </label>
            <div className="flex items-center space-x-2 p-2.5 border border-gray-200 bg-gray-50 rounded-md min-h-[42px]">
                {loadingApiAnnouncementTime ? 
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div> 
                    : <ClockIcon className="w-5 h-5 text-gray-500 shrink-0"/>
                }
                <span className="text-sm text-gray-700 cursor-default">
                    {/* Display using apiFetchedAnnouncementTime, as formatDateTimeReadable handles parsing */}
                    {loadingApiAnnouncementTime ? 'Memuat...' : formatDateTimeReadable(apiFetchedAnnouncementTime)}
                    {announcementTimeError && !loadingApiAnnouncementTime && <span className="text-red-600">Gagal memuat.</span>}
                </span>
            </div>
          </div>
        </div>
      </Card>


      <Card title="Informasi Konfigurasi">
        <ul className="list-disc list-inside space-y-3 text-sm text-text-secondary">
            <li>Aplikasi ini menggunakan konfigurasi dengan urutan prioritas:
                <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                    <li><b>Link API:</b>
                        <ul className="list-disc list-inside ml-4">
                            <li><b>Kustom Pengguna (Penyimpanan Lokal):</b> Jika Anda menyimpan Link API melalui form di atas, setelan tersebut akan digunakan khusus di peramban ini.</li>
                            <li><b>Konfigurasi Server (<code>public/config.json</code>):</b> Jika tidak ada setelan kustom, aplikasi akan memuat Link API dari <code>public/config.json</code>. Untuk mengubah ini secara global, edit file tersebut dan deploy ulang.</li>
                            <li><b>Default Aplikasi (Hardcode):</b> Jika kedua metode di atas gagal/tidak tersedia, aplikasi akan menggunakan Link API default: <code>{DEFAULT_API_BASE_URL}</code>.</li>
                        </ul>
                    </li>
                    <li className="mt-2"><b>Waktu Pengumuman:</b>
                        <ul className="list-disc list-inside ml-4">
                            <li>Sepenuhnya dikelola melalui <b>API Server</b> (endpoint <code>/api/waktu-pengumuman</code>).</li>
                            <li>Perubahan yang Anda buat di atas akan langsung disimpan ke server. Waktu yang diinput (dalam zona waktu lokal peramban Anda) akan dikonversi ke UTC.</li>
                            <li>Waktu Pengumuman Resmi selalu ditampilkan dalam format WIB (Waktu Indonesia Barat). String waktu dari server yang tidak memiliki offset eksplisit akan diinterpretasikan sebagai WIB.</li>
                        </ul>
                    </li>
                </ol>
            </li>
            <li>Tombol "Reset ke Default API" akan menghapus setelan Link API kustom dari peramban Anda, mengembalikan penggunaan ke <code>public/config.json</code> atau default aplikasi.</li>
            <li>Untuk mengosongkan waktu pengumuman, hapus nilai dari input "Ubah Waktu Pengumuman" dan klik "Simpan Waktu ke Server".</li>
            <li>Contoh isi <code>public/config.json</code> (hanya untuk Link API):
                <pre className="bg-gray-100 p-2 rounded-md text-xs mt-1 overflow-x-auto">
{`{
  "apiBaseUrl": "https://nama-domain-api-anda.com/"
}`}
                </pre>
            </li>
        </ul>
      </Card>
    </div>
  );
};

export default PengaturanPage;
