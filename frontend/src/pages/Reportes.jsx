import { useEffect, useRef, useState } from 'react'
import { reportesAPI } from '../services/api'
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const PIE_COLORS = ['#4f46e5','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function ReportViewerPro() {
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState(false)
  const [stats, setStats] = useState(null)
  const [mensual, setMensual] = useState([])
  const [tipos, setTipos] = useState([])
  const [zoom, setZoom] = useState(1)

  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [estado, setEstado] = useState('todos')

  const sheetRef = useRef(null)

  useEffect(() => { fetchData() }, []) 

  async function fetchData() {
    setLoading(true); setDemo(false)
    try {
      const params = {
      
        fecha_inicio: desde || undefined,
        fecha_fin:    hasta || undefined,
        fecha_desde:  desde || undefined,
        fecha_hasta:  hasta || undefined,
        estado: estado !== 'todos' ? estado : undefined,
      }

      const [s, m, t] = await Promise.all([
        reportesAPI.getEstadisticas(params).catch(() => null),
        reportesAPI.getExpedientesPorMes(params).catch(() => null),
        reportesAPI.getIndiciosPorTipo(params).catch(() => null),
      ])

      
      const payload = (res) => res?.data?.data ?? res?.data ?? res ?? null

      const est = payload(s) || {}
  
      const totalExpedientes =
        (Array.isArray(est.por_estado) ? est.por_estado.reduce((a,b)=>a + Number(b.cantidad||0), 0) : 0)
        || (Array.isArray(est.por_mes) ? est.por_mes.reduce((a,b)=>a + Number(b.expedientes||0), 0) : 0)

      const mapEstado = (name) => (est.por_estado || []).find(e => (e.estado||'').toLowerCase() === name)
      const countEstado = (n) => Number(mapEstado(n)?.cantidad || 0)

      const pendientes = countEstado('pendiente') + countEstado('en revision') + countEstado('en_proceso')
      const aprobados  = countEstado('aprobado')
      const totalIndicios = Number(est.total_indicios || 0)

      setStats({
        totalExpedientes,
        expedientesPendientes: pendientes,
        expedientesCompletados: aprobados,
        totalIndicios
      })

 
      const mensRaw = payload(m) || []

      const mens = (Array.isArray(mensRaw) ? mensRaw : []).map(r => ({
        mes: (r.mes_largo ? r.mes_largo.slice(0,3) : r.mes) || String(r.mes_num || '').padStart(2,'0'),
        cantidad: Number(r.cantidad || r.expedientes || 0),
      }))
      setMensual(mens)

      
      const tiposRaw = payload(t) || []
      const tiposOk = (Array.isArray(tiposRaw) ? tiposRaw : []).map(x => ({
        name: x.name || x.tipo || 'sin_tipo',
        cantidad: Number(x.cantidad || 0),
      }))
      setTipos(tiposOk)

     
      const hayAlgo = mens.length || tiposOk.length || totalExpedientes || totalIndicios
      if (!hayAlgo) {
        const d = demoData()
        setStats(d.stats); setMensual(d.mensual); setTipos(d.tipos); setDemo(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => fetchData()
  const limpiarFiltros = () => { setDesde(''); setHasta(''); setEstado('todos'); fetchData() }

  async function exportPNG() {
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a'); a.href = url; a.download = 'reporte.png'; a.click()
    } catch { window.print() }
  }
  async function exportPDF() {
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(sheetRef.current, { scale: 2, backgroundColor: '#ffffff' })
      const img = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = canvas.height * (w / canvas.width)
      let y = 0
      pdf.addImage(img, 'PNG', 0, y, w, h)
      while (h - (pdf.internal.pageSize.getHeight() - y) > 0) {
        pdf.addPage(); y -= pdf.internal.pageSize.getHeight()
        pdf.addImage(img, 'PNG', 0, y, w, h)
      }
      pdf.save('reporte.pdf')
    } catch { window.print() }
  }

  const kpi = (key, def=0) => stats?.[key] ?? def

  return (
    <div className="space-y-4">
     
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Desde</label>
            <input type="date" value={desde} onChange={e=>setDesde(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"/>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Hasta</label>
            <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"/>
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
            <select value={estado} onChange={e=>setEstado(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              <option value="todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revision">En Revisión</option>
              <option value="Revisado">Revisado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-1">
            <button onClick={limpiarFiltros}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Limpiar
            </button>
            <button onClick={aplicarFiltros}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Aplicar
            </button>
          </div>
        </div>
      </div>

    
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">Visor de Reporte</span>
          {demo && <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700">demo</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setZoom(z=>Math.max(0.75, +(z-0.25).toFixed(2)))}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">−</button>
          <span className="w-14 text-center text-sm">{Math.round(zoom*100)}%</span>
          <button onClick={()=>setZoom(z=>Math.min(1.75, +(z+0.25).toFixed(2)))}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">+</button>
          <div className="mx-2 h-6 w-px bg-gray-200" />
          <button onClick={()=>window.print()} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">🖨️</button>
          <button onClick={exportPNG} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">🖼️</button>
          <button onClick={exportPDF} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">📄</button>
        </div>
      </div>

 
      <div className="overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div ref={sheetRef}
          className="mx-auto w-[794px] origin-top rounded-xl bg-white p-6 shadow-lg"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
        
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Informe General</h1>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Generado</div>
              <div className="text-sm font-medium text-gray-800">{new Date().toLocaleString()}</div>
            </div>
          </div>

      
          <div className="mb-6 grid grid-cols-4 gap-3">
            <KPI title="Total Expedientes" value={kpi('totalExpedientes', mensual.reduce((a,b)=>a+(b.cantidad||0),0))} color="from-indigo-500 to-violet-600"/>
            <KPI title="Pendientes" value={kpi('expedientesPendientes', 0)} color="from-amber-500 to-yellow-600"/>
            <KPI title="Aprobados" value={kpi('expedientesCompletados', 0)} color="from-emerald-500 to-green-600"/>
            <KPI title="Total Indicios" value={kpi('totalIndicios', tipos.reduce((a,b)=>a+(b.cantidad||0),0))} color="from-fuchsia-500 to-purple-600"/>
          </div>

        
          <div className="mb-6 grid grid-cols-2 gap-4">
            <Card title="Expedientes por Mes">
              {loading ? <Skeleton/> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mensual}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" /><YAxis allowDecimals={false} />
                    <Tooltip /><Legend />
                    <Bar dataKey="cantidad" fill="#4f46e5" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card title="Indicios por Tipo">
              {loading ? <Skeleton/> : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={tipos} dataKey="cantidad" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      labelLine={false} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                      {tipos.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

      
          <Card title="Tendencia Acumulada">
            {loading ? <Skeleton/> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={buildAcumulado(mensual)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" /><YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="acumulado" stroke="#22c55e" strokeWidth={3} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

    
          <Card title="Resumen (ejemplo)">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="py-2">Mes</th><th className="py-2">Cantidad</th><th className="py-2">Acumulado</th></tr></thead>
              <tbody>
                {buildAcumulado(mensual).map((r,i)=>(
                  <tr key={i} className="border-t">
                    <td className="py-1.5">{r.mes}</td>
                    <td className="py-1.5">{mensual[i]?.cantidad ?? '-'}</td>
                    <td className="py-1.5 font-medium text-gray-900">{r.acumulado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} DICRI — Reporte generado automáticamente.
          </div>
        </div>
      </div>
    </div>
  )
}


function KPI({ title, value, color }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-3">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10`} />
      <div className="relative">
        <div className="text-xs font-medium text-gray-500">{title}</div>
        <div className="mt-1 text-xl font-bold text-gray-900">{value ?? 0}</div>
      </div>
    </div>
  )
}
function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="mb-2 text-sm font-semibold text-gray-900">{title}</div>
      {children}
    </div>
  )
}
function Skeleton(){ return <div className="h-[220px] w-full animate-pulse rounded-lg bg-gray-100" /> }

function buildAcumulado(data){
  let acc=0; return (data||[]).map(d=>({ mes:d.mes, acumulado:(acc+=(Number(d.cantidad)||0)) }))
}
function demoData(){
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const mensual=meses.map((mes,i)=>({ mes, cantidad: Math.max(1, Math.round(6 + Math.sin(i/2)*4 + Math.random()*6)) }))
  const tiposBase=['digital','biológico','físico','documental','fotográfico','otro']
  const tipos=tiposBase.map(name=>({ name, cantidad: Math.max(1, Math.round(Math.random()*12)) }))
  const total=mensual.reduce((a,b)=>a+b.cantidad,0)
  return {
    stats:{ totalExpedientes:total, expedientesPendientes:Math.round(total*0.23), expedientesCompletados:Math.round(total*0.57), totalIndicios: tipos.reduce((a,b)=>a+b.cantidad,0) },
    mensual, tipos
  }
}
