import React,{useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {api} from './services/api'
import type {Appointment} from './types'

import AdminCalendar from './AdminCalendar'
import AdminSlots from './AdminSlots'

function todayISO(){
return new Date().toISOString().split('T')[0]
}

export default function Admin(){

const navigate = useNavigate()

const [isLoggedIn,setIsLoggedIn]=useState(false)
const [password,setPassword]=useState('')
const [appointments,setAppointments]=useState<Appointment[]>([])
const [selectedDate,setSelectedDate]=useState(todayISO())
const [currentMonth,setCurrentMonth]=useState(new Date())
const [loading,setLoading]=useState(false)

const [rescheduleApp,setRescheduleApp]=useState<any|null>(null)

async function fetchAppointments(){

if(loading) return

setLoading(true)

try{

const data = await api.getAdminAppointments()

if(Array.isArray(data)){
setAppointments(data)
}else{
setAppointments([])
}

}catch{

setAppointments([])
}

setLoading(false)

}

useEffect(()=>{

if(!isLoggedIn) return
fetchAppointments()

},[isLoggedIn])

useEffect(()=>{

if(!isLoggedIn) return
fetchAppointments()

},[selectedDate])

useEffect(()=>{

if(!isLoggedIn) return

const interval=setInterval(()=>{

if(document.visibilityState==='visible'){
fetchAppointments()
}

},20000)

return ()=>clearInterval(interval)

},[isLoggedIn])

async function handleLogin(e:React.FormEvent){

e.preventDefault()

try{

await api.adminLogin(password)

setPassword('')
setIsLoggedIn(true)

}catch{

alert('Password incorreta')

}

}

async function handleLogout(){

try{
await api.adminLogout()
}catch{}

setIsLoggedIn(false)
setAppointments([])
navigate('/')

}

async function updateStatus(id:string,status:string){

try{

await api.updateAppointment(id,{status})
await fetchAppointments()

}catch{

alert('Erro ao atualizar marcação')

}

}

async function deleteAppointment(id:string){

const ok=confirm('Tem a certeza que deseja apagar esta marcação?')
if(!ok) return

try{

await api.deleteAppointment(id)
await fetchAppointments()

}catch{

alert('Erro ao apagar marcação')

}

}

async function toggleBlock(time:string){

try{

await fetch('/api/appointments',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
name:'HORÁRIO BLOQUEADO',
whatsapp:'-',
services:'["bloqueio_manual"]',
date:selectedDate,
time,
status:'bloqueado'
})
})

await fetchAppointments()

}catch{

alert('Erro ao bloquear horário')

}

}

async function openCreate(date:string,time:string){

const name=prompt('Nome da cliente')
if(!name) return

const whatsapp=prompt('WhatsApp')
if(!whatsapp) return

try{

await api.createAppointment({
name,
whatsapp,
services:'[]',
date,
time
})

await fetchAppointments()

}catch{

alert('Erro ao criar marcação')

}

}

function openEdit(app:any){

const name=prompt('Nome',app.name)
if(!name) return

const whatsapp=prompt('WhatsApp',app.whatsapp)
if(!whatsapp) return

api.updateAppointment(app.id,{name,whatsapp}).then(fetchAppointments)

}

function openReschedule(app:any){

setRescheduleApp(app)
setSelectedDate(app.date)

}

async function confirmReschedule(time:string){

if(!rescheduleApp) return

const formatted=JSON.stringify([time])

await api.updateAppointment(rescheduleApp.id,{
date:selectedDate,
time:formatted
})

setRescheduleApp(null)

await fetchAppointments()

}

const dayAppointments=appointments.filter((a:any)=>a.date===selectedDate)

if(!isLoggedIn){

return(

<div className="pt-40 flex justify-center">

<form onSubmit={handleLogin} className="space-y-6 text-center">

<input
type="password"
value={password}
onChange={e=>setPassword(e.target.value)}
className="border px-6 py-4 w-64 text-center"
placeholder="Password"
autoFocus
/>

<button
type="submit"
disabled={!password}
className="bg-brand-gold text-white px-8 py-4 disabled:opacity-50"

>

Entrar </button>

</form>

</div>

)

}

return(

<div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">

<div className="flex justify-between items-center mb-12">

<h1 className="text-5xl font-serif italic">
Admin
</h1>

<div className="flex items-center gap-6">

<div className="text-center">
<p className="text-xs text-stone-400 uppercase tracking-widest">
Marcações hoje
</p>
<p className="font-serif text-xl">
{dayAppointments.length}
</p>
</div>

<span className="text-xs text-stone-400">
{loading?'Atualizar…':'Atualizado'}
</span>

<button
onClick={handleLogout}
className="bg-red-50 text-red-700 px-6 py-3 rounded-full"

>

Sair </button>

</div>

</div>

<div className="grid lg:grid-cols-12 gap-12">

<div className="lg:col-span-7">

<AdminCalendar
currentMonth={currentMonth}
setCurrentMonth={setCurrentMonth}
selectedDate={selectedDate}
setSelectedDate={setSelectedDate}
appointments={appointments}
/>

</div>

<div className="lg:col-span-5">

<AdminSlots
selectedDate={selectedDate}
appointments={appointments}
openCreate={openCreate}
toggleBlock={rescheduleApp?confirmReschedule:toggleBlock}
openEdit={openEdit}
openReschedule={openReschedule}
updateStatus={updateStatus}
deleteAppointment={deleteAppointment}
/>

</div>

</div>

{rescheduleApp && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white p-10 rounded-3xl max-w-lg w-full">

<h2 className="font-serif text-3xl mb-6">
Mudar hora / dia
</h2>

<p className="text-sm text-stone-500 mb-6">
Selecione um novo dia no calendário e depois escolha um horário.
</p>

<button
onClick={()=>setRescheduleApp(null)}
className="mt-6 border px-6 py-3 rounded-xl"

>

Cancelar </button>

</div>

</div>

)}

</div>

)

}
