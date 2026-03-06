import React from 'react'

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
}: any){

  function appointmentAt(time:string){

    return appointments.find((a:any)=>{
      if(a.date !== selectedDate) return false

      try{
        const t = JSON.parse(a.time)
        return t.includes(time)
      }catch{
        return a.time === time
      }
    })
  }

  return(

  <div className="space-y-4">

    {TIMES.map(time=>{

      const app = appointmentAt(time)

      return(

      <div key={time} className="p-6 border rounded-2xl">

        <div className="flex justify-between mb-2">
          <span className="font-serif text-xl">{time}</span>
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
              <p className="text-xs text-stone-400">{app.whatsapp}</p>

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

            <button
              onClick={()=>deleteAppointment(app.id)}
              className="border border-red-300 text-red-600 py-2 rounded-xl w-full"
            >
              Apagar
            </button>

          </div>

        )}

      </div>

      )

    })}

  </div>

  )
}
