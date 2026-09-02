import React from 'react';
const Threats = () => {
  return (
    <div className="min-h-screen bg-[#0b132b] font-mono p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider [text-shadow:0_0_30px_rgba(0,229,255,0.05)]">
             Threat Intelligence
          </h1>
          <p className="text-[0.8rem] text-[rgba(0,229,255,0.5)] tracking-wider mt-1">
            Real-time threat detection and monitoring
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '1,284', label: 'Total Threats' },
            { value: '23', label: 'Critical' },
            { value: '156', label: 'High Priority' },
            { value: '98.7%', label: 'Detection Rate' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 md:p-6 text-center rounded-xl border border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)] hover:border-[rgba(0,229,255,0.15)] hover:-translate-y-1 transition-all"
            >
              <div className="text-2xl md:text-3xl font-black text-[#00e5ff] [text-shadow:0_0_20px_rgba(0,229,255,0.2)]">
                {stat.value}
              </div>
              <div className="text-[0.6rem] md:text-[0.65rem] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 md:p-12 text-center rounded-xl border border-dashed border-[rgba(0,229,255,0.06)] bg-[rgba(0,229,255,0.02)] text-[rgba(255,255,255,0.3)]">
          <p>🔍 Threat detection dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
};
export default Threats;