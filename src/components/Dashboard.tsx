
import React, { useState, useEffect, type JSX } from 'react';
import Card from './Card.tsx';
import { ApiStatusIcon, ClockIcon } from './icons.tsx';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.ts';
import { type Student } from '@/lib/types.ts';
import TotalStudentsCard from './TotalStudentsCard.tsx';
import { checkApiStatus, type ApiStatus as ApiStatusType } from '../services/studentService.ts';
import { fetchApiAnnouncementOpenTime } from '../services/configService.ts';
import { formatDateTimeReadable, parseServerWibStringToDate } from '@/lib/constants.ts';
import config from "@/config/config.json"

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}

const AnimatedSection = ({ children, className, delay = 'duration-700' }: AnimatedSectionProps): JSX.Element => {
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

interface DashboardProps {
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const [apiStatus, setApiStatus] = useState<ApiStatusType | null>(null);
  const [loadingApiStatus, setLoadingApiStatus] = useState<boolean>(true);
  
  // Stores the raw ISO string from the API
  const [rawAnnouncementTime, setRawAnnouncementTime] = useState<string | null>(null);
  const [loadingAnnouncementTime, setLoadingAnnouncementTime] = useState<boolean>(true);
  
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const totalStudents = students.length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingApiStatus(true);
      const status = await checkApiStatus();
      setApiStatus(status);
      setLoadingApiStatus(false);

      setLoadingAnnouncementTime(true);
      try {
        const time = await fetchApiAnnouncementOpenTime();
        setRawAnnouncementTime(time); // Store the raw string
      } catch (error) {
        console.error("Dashboard: Failed to fetch announcement time", error);
      } finally {
        setLoadingAnnouncementTime(false);
      }
    };
    
    fetchDashboardData();

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // formattedAnnouncementTime will use the updated formatDateTimeReadable
  const formattedAnnouncementTime = formatDateTimeReadable(rawAnnouncementTime);
  let announcementStatusMessage = formattedAnnouncementTime;

  if (loadingAnnouncementTime) {
    announcementStatusMessage = "Memuat waktu pengumuman...";
  } else if (rawAnnouncementTime) {
    const now = new Date(); // User's local time
    // Parse the raw server time string correctly, assuming it's WIB if naive
    const openTimeDate = parseServerWibStringToDate(rawAnnouncementTime); 

    if (openTimeDate && now < openTimeDate) {
      announcementStatusMessage = `Akan dibuka: ${formattedAnnouncementTime}`;
    } else if (openTimeDate) {
      announcementStatusMessage = `Telah dibuka: ${formattedAnnouncementTime}`;
    } else {
      // This case handles if parseServerWibStringToDate returns null (invalid format)
      announcementStatusMessage = "Waktu pengumuman tidak valid atau gagal dimuat.";
    }
  } else {
    announcementStatusMessage = "Waktu pengumuman belum ditentukan atau gagal dimuat.";
  }

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <h1 className="text-3xl font-semibold text-text-primary">
          Selamat datang, Admin!
        </h1>
        <p className="text-text-secondary mt-1">
          Ini adalah halaman dashboard utama Anda.
        </p>
      </AnimatedSection>

      <div className="flex flex-wrap gap-6">
        <AnimatedSection delay="duration-900" className="w-full md:w-[calc(50%-0.75rem)]">
          <TotalStudentsCard count={totalStudents} />
        </AnimatedSection>

        <AnimatedSection delay="duration-1000" className="w-full md:w-[calc(50%-0.75rem)]">
          <Card title="Status Sistem">
            {loadingApiStatus ? (
              <div className="flex items-center space-x-3">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                 <p className="text-text-secondary">Memeriksa status API...</p>
              </div>
            ) : apiStatus ? (
              <div className="flex items-center space-x-3">
                <ApiStatusIcon 
                  className={`w-8 h-8 ${apiStatus.online ? 'text-brand-accent-green' : 'text-danger'}`} 
                  online={apiStatus.online} 
                />
                <div>
                  <p className={`text-lg font-medium ${apiStatus.online ? 'text-brand-accent-green' : 'text-danger'}`}>
                    API {apiStatus.online ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {apiStatus.message}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-text-secondary">Tidak dapat memuat status API.</p>
            )}
          </Card>
        </AnimatedSection>
        
        <AnimatedSection delay="duration-1100" className="w-full md:w-[calc(50%-0.75rem)]">
          <Card title="Informasi Pengumuman">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-full">
                {loadingAnnouncementTime ? 
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div> 
                    : <ClockIcon className="w-6 h-6 text-indigo-600" />
                }
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  Waktu Pengumuman (WIB)
                </p>
                <p className="text-sm text-text-secondary">
                  {announcementStatusMessage}
                </p>
              </div>
            </div>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay="duration-1200" className="w-full md:w-[calc(50%-0.75rem)]">
          <Card title="Waktu Saat Ini">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  Lokal Klien
                </p>
                <p className="text-sm text-text-secondary whitespace-nowrap">
                  {formatDateTimeReadable(currentTime.toISOString())} 
                </p>
              </div>
            </div>
          </Card>
        </AnimatedSection>

      </div>
    </div>
  );
};

export default Dashboard;
