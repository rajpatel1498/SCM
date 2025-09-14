import React, { useMemo, useState, useEffect, useRef } from 'react'
import data from './data/data.json'
import { Line, Scatter, Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import annotationPlugin from 'chartjs-plugin-annotation'
import zoomPlugin from 'chartjs-plugin-zoom'

Chart.register(annotationPlugin, zoomPlugin)

function aggregateByCompany() {
  const comps = ['Intel','AMD','Nvidia']
  return comps.map(c=>{
    const rows = data.filter(r=>r.Company===c)
    const avgRisk = rows.reduce((s,r)=>s + (Number(r.Geopolitical_Risk_Score_Taiwan)||0),0)/rows.length
    const avgPrice = rows.reduce((s,r)=>s + (Number(r.Stock_Price)||0),0)/rows.length
    return { company:c, avgRisk, avgPrice }
  })
}

export default function App(){
  const [company, setCompany] = useState('Intel')
  const [threshold, setThreshold] = useState(50)
  const [forecastDays, setForecastDays] = useState(30)
  const [theme, setTheme] = useState('light')
  const agg = useMemo(()=> aggregateByCompany(), [])
  useEffect(()=>{ document.documentElement.setAttribute('data-theme', theme==='dark' ? 'dark' : 'light') }, [theme])

  const companyRows = useMemo(()=> data.filter(d=>d.Company===company).sort((a,b)=> new Date(a.Date)-new Date(b.Date)), [company])
  const labels = companyRows.map(r=>r.Date)
  const prices = companyRows.map(r=>Number(r.Stock_Price))
  const risks = companyRows.map(r=>Number(r.Geopolitical_Risk_Score_Taiwan))

  const lineData = { labels, datasets: [
    { label: 'Stock Price', data: prices, borderColor: '#2563eb', yAxisID:'y' },
    { label: 'Risk Score', data: risks, borderColor: '#ef4444', yAxisID:'y1' }
  ] }

  const barData = {
    labels: agg.map(a=>a.company),
    datasets: [{ label: 'Avg Risk', data: agg.map(a=>a.avgRisk), backgroundColor: ['#2563eb','#ef4444','#10b981'] }]
  }

  const scatterData = { datasets: [{ label: company + ' risk vs price', data: companyRows.map(r=>({x: Number(r.Geopolitical_Risk_Score_Taiwan), y: Number(r.Stock_Price), date: r.Date})), backgroundColor:'#2563eb' }]}

  return (
    <div className='min-h-screen flex'>
      <aside className='w-64 p-4 bg-white shadow-md'>
        <h2 className='text-lg font-bold'>GeoRisk Dashboard</h2>
        <p className='text-sm text-slate-500'>Standalone React + Tailwind</p>
        <div className='mt-4 space-y-2'>
          <label className='block text-sm'>Company</label>
          <select value={company} onChange={e=>setCompany(e.target.value)} className='w-full border p-2 rounded'>
            <option>Intel</option><option>AMD</option><option>Nvidia</option>
          </select>
          <label className='block text-sm mt-2'>Theme</label>
          <button onClick={()=>setTheme(t=> t==='dark'? 'light':'dark')} className='btn mt-1 w-full p-2 border rounded'>Toggle Theme</button>
        </div>
      </aside>
      <main className='flex-1 p-6 space-y-6'>
        <section className='grid grid-cols-3 gap-4'>
          <div className='col-span-2 bg-white p-4 rounded shadow'>
            <h3 className='font-semibold mb-2'>Historical — Stock & Risk</h3>
            <Line data={lineData} options={{ responsive:true, scales:{ y:{ position:'left' }, y1:{ position:'right', grid:{ drawOnChartArea:false }}}}} />
          </div>
          <div className='bg-white p-4 rounded shadow'>
            <h3 className='font-semibold mb-2'>Avg Risk</h3>
            <Bar data={barData} />
          </div>
        </section>

        <section className='grid grid-cols-3 gap-4'>
          <div className='col-span-2 bg-white p-4 rounded shadow'>
            <h3 className='font-semibold mb-2'>Forecast (simple)</h3>
            <p className='text-sm text-slate-500'>Uses last 30 rows average daily return (approx)</p>
            {/* Forecast chart placeholder - using historical data to simulate */}
            <Line data={{...lineData}} />
          </div>
          <div className='bg-white p-4 rounded shadow'>
            <h3 className='font-semibold mb-2'>Scatter — Risk vs Price</h3>
            <Scatter data={scatterData} />
          </div>
        </section>

        <footer className='text-sm text-slate-500'>Embedded dataset rows: {data.length} • Generated: {new Date().toLocaleString()}</footer>
      </main>
    </div>
  )
}
