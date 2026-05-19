"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ReportsCharts({ results }: { results: any[] }) {
  if (!results || results.length === 0) return null;

  // Calculate overall stats
  let totalCorrect = 0;
  let totalIncorrect = 0;
  
  // Stats by grammar focus
  const focusStats: Record<string, { correct: number, incorrect: number }> = {};

  results.forEach(r => {
    r.details.forEach((d: any) => {
      const focus = d.question.grammarFocus || 'Genel';
      if (!focusStats[focus]) focusStats[focus] = { correct: 0, incorrect: 0 };

      if (d.isCorrect) {
        totalCorrect++;
        focusStats[focus].correct++;
      } else {
        totalIncorrect++;
        focusStats[focus].incorrect++;
      }
    });
  });

  const pieData = [
    { name: 'Doğru', value: totalCorrect },
    { name: 'Yanlış', value: totalIncorrect }
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  const barData = Object.keys(focusStats).map(key => ({
    name: key,
    Doğru: focusStats[key].correct,
    Yanlış: focusStats[key].incorrect
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
      <div className="glass-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Genel Doğru/Yanlış Oranı</h3>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{ color: COLORS[0] }}>■ Doğru: {totalCorrect}</span>
          <span style={{ color: COLORS[1] }}>■ Yanlış: {totalIncorrect}</span>
        </div>
      </div>

      <div className="glass-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Konu/Odak Bazlı Dağılım</h3>
        <div style={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.1)'}} />
              <Bar dataKey="Doğru" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Yanlış" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
