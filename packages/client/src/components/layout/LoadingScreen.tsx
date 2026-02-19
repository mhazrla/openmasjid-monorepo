import React from 'react';

export const LoadingScreen: React.FC = () => 
{
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-4 text-emerald-800 font-semibold text-lg animate-pulse">
        Loading Open Masjid App...
      </h2>
      <p className="text-slate-500 text-sm mt-1">Please wait a moment</p>
    </div>
  );
};
