import React,{useEffect,useRef} from 'react'
import { MessageCircle } from 'lucide-react'

const TIMES = [
'09:00','09:30','10:00','10:30','11:00','11:30',
'12:00','12:30','14:00','14:30','15:00','15:30',
'16:00','16:30','17:00','17:30','18:00'
]

export default function AdminSlots({
selectedDate,
appointments,
openCreate,
toggleBlock,
openEdit,
openReschedule,
updateStatus,
deleteAppointment
}:any){

const slotRefs = useRef<Record<string,HTMLDivElement|null>>({})

function appointmentAt(time:string){

return appointments.find((a:any)=>{

if(a.date!==selectedDate) return false

try{
const t = JSON.parse(a.time)
return t.includes(time)
}catch{
return a.time===time
}

})

}

function displayTime(time:string,app:any){

if(!app) return time

try{

const t = JSON.parse(app.time)

if(Array.isArray(t) && t.length>1){

const start = t[0]
const end = t[t.length-1]

return `${start}–${end}`

}

}catch{}

return time

}

function waLink(phone:string,name:string){

const digits = String(phone||'').replace(/\D/g,'')
const text = encodeURIComponent(`Olá ${name}, relativamente à sua marcação.`)

if(!digits) return `https://wa.me/?text=${text}`

return `https://wa.me/${digits}?text=${text}`

}

function priceToCents(v:any){
const n = Number(v)
if(!n) return 0
return Math.round(n*100)
}

function servicesTotalCents(app:any){

if(!app.services) return 0

try{

const s = JSON.parse(app.services)

if(Array.isArray(s)){
return s.reduce((sum:any,x:any)=>sum+priceToCents(x.price),0)
}

}catch{}

return 0

}

const dayAppointments = appointments.filter((a:any)=>a.date===selectedDate)

const confirmedTotal = dayAppointments
.filter((a:any)=>a.status==='confirmado')
.reduce((sum:any,a:any)=>sum+servicesTotalCents(a),0)

const pendingTotal = dayAppointments
.filter((a:any)=>a.status==='por_confirmar')
.reduce((sum:any,a:any)=>sum+servicesTotalCents(a),0)

useEffect(()=>{

const now = new Date()

const current =
String(now.getHours()).padStart(2,'0') +
':' +
(now.getMinutes()<30?'00':'30')

const closest = TIMES.find(t=>t>=current)

if(!closest) return

const el = slotRefs.current[closest]

if(el){
el.scrollIntoView({behavior:'smooth',block:'center'})
}

},[selectedDate])

return(

<div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">

<div className="p-6 border rounded-2xl bg-stone-50 flex justify-between">

<div>
<p className="text-xs uppercase tracking-widest text-stone-400">
Confirmado
</p>
<p className="text-2xl font-serif">
{(confirmedTotal/100).toFixed(2)}€
</p>
</div>

<div>
<p className="text-xs uppercase tracking-widest text-stone-400">
Pedidos
</p>
<p className="text-2xl font-serif">
{(pendingTotal/100).toFixed(2)}€
</p>
</div>

</div>

{TIMES.map(time=>{

const app = appointmentAt(time)

return(

<div
key={time}
ref={el=>slotRefs.current[time]=el}
className="p-6 border rounded-2xl"
>

<div className="flex justify-between mb-2">

<span className="font-serif text-xl">
{displayTime(time,app)}
</span>

{app && (
<span className="text-xs font-bold uppercase tracking-widest">
{app.status==='confirmado'?'Confirmado':'Por confirmar'}
</span>
)}

</div>

{!app && (

<div className="grid grid-cols-2 gap-2">

<button
onClick={()=>openCreate(selectedDate,time)}
className="bg-brand-gold text-white py-2 rounded-xl"
>
Nova
</button>

<button
onClick={()=>toggleBlock(time)}
className="border py-2 rounded-xl"
>
Bloquear
</button>

</div>

)}

{app && (

<div className="space-y-3">

<div>

<p className="font-serif text-lg">{app.name}</p>

<p className="text-xs text-stone-400">
{app.whatsapp}
</p>

</div>

<div className="grid grid-cols-3 gap-2">

<button
onClick={()=>updateStatus(app.id,'confirmado')}
className="bg-emerald-600 text-white py-2 rounded-xl"
>
Confirmar
</button>

<button
onClick={()=>openReschedule(app)}
className="bg-blue-600 text-white py-2 rounded-xl"
>
Reagendar
</button>

<button
onClick={()=>openEdit(app)}
className="bg-stone-800 text-white py-2 rounded-xl"
>
Editar
</button>

</div>

<div className="grid grid-cols-2 gap-2">

<a
href={waLink(app.whatsapp,app.name)}
target="_blank"
rel="noreferrer"
className="flex items-center justify-center gap-2 border border-green-300 text-green-700 py-2 rounded-xl"
>
<MessageCircle size={18}/>
Enviar SMS
</a>

<button
onClick={()=>deleteAppointment(app.id)}
className="border border-red-300 text-red-600 py-2 rounded-xl"
>
Apagar
</button>

</div>

</div>

)}

</div>

)

})}

</div>

)

}
