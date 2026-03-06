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

async function fetchAppointments(){

try{

const data = await api.getAdminAppointments()
setAppointments(data||[])
setIsLoggedIn(true)

}catch{

setAppointments([])

}

}

useEffect(()=>{

fetchAppointments()

},[])

async function handleLogin(e:any){

e.preventDefault()

try{

await api.adminLogin(password)

setPassword('')
setIsLoggedIn(true)

await fetchAppointments()

}catch{

alert('Password incorreta')

}

}

async function handleLogout(){

await api.adminLogout()

setIsLoggedIn(false)
setAppointments([])

navigate('/')

}

async function updateStatus(id:string,status:any){

await api.updateAppointment(id,{status})
await fetchAppointments()

}

async function deleteAppointment(id:string){

if(!confirm('Apagar marcação?')) return

await api.deleteAppointment(id)

await fetchAppointments()

}

async function toggleBlock(time:string){

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

}

function openCreate(){}

function openEdit(){}

function openReschedule(){}

if(!isLoggedIn){

return(

<div className="pt-40 flex justify-center">

<form onSubmit={handleLogin} className="space-y-6">

<input
type="password"
value={password}
onChange={e=>setPassword(e.target.value)}
className="border px-6 py-4"
/>

<button className="bg-brand-gold text-white px-8 py-4">
Entrar
</button>

</form>

</div>

)

}

return(

<div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">

<div className="flex justify-between mb-12">

<h1 className="text-5xl font-serif italic">
Admin
</h1>

<button
onClick={handleLogout}
className="bg-red-50 text-red-700 px-6 py-3 rounded-full"
>
Sair
</button>

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
toggleBlock={toggleBlock}
openEdit={openEdit}
openReschedule={openReschedule}
updateStatus={updateStatus}
deleteAppointment={deleteAppointment}
/>

</div>

</div>

</div>

)

}
