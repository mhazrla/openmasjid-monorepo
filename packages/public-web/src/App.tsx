import React from 'react';

function App() 
{
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">Masjid Public Web</h1>
        <p className="text-slate-500 mb-6">Welcome to the new public interface</p>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;
