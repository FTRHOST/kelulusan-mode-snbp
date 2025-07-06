
import React from 'react';
import Card from './Card.tsx';
import { StudentsIcon } from './icons.tsx';

interface TotalStudentsCardProps {
  count: number;
}

const TotalStudentsCard: React.FC<TotalStudentsCardProps> = ({ count }) => {
  return (
    <Card title="Total Siswa">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <StudentsIcon className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-text-primary">{count}</p>
          <p className="text-sm text-text-secondary">Siswa Terdaftar</p>
        </div>
      </div>
    </Card>
  );
};

export default TotalStudentsCard;
