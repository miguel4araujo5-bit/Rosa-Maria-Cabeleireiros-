import React from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(x, diff)
}

function endOfWeekMonday(d: Date) {
  return addDays(startOfWeekMonday(d), 6)
}

function daysBetweenInclusive(start: Date, end: Date) {
  const out: Date[] = []
  let cur = new Date(start)
  while (cur <= end) {
    out.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return out
}

export default function AdminCalendar({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  appointments
}: any) {

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  const gridStart = startOfWeekMonday(monthStart)
  const gridEnd = endOfWeekMonday(monthEnd)

  const calendarDays = daysBetweenInclusive(gridStart, gridEnd)

  function bookingsCountOnDay(date: Date) {
    const dateStr = toISODate(date)

    return appointments.filter((a: any) =>
      String(a.date) === dateStr &&
      (a.status === 'por_confirmar' || a.status === 'confirmado')
    ).length
  }

  const today = toISODate(new Date())

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-stone-100">

      <div className="flex justify-between items-center mb-10">

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
            )
          }
          className="p-4 hover:bg-stone-50 rounded-full"
        >
          ←
        </button>

        <h2 className="text-4xl font-serif italic capitalize">
          {new Intl.DateTimeFormat('pt-PT', {
            month: 'long',
            year: 'numeric'
          }).format(currentMonth)}
        </h2>

        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
            )
          }
          className="p-4 hover:bg-stone-50 rounded-full"
        >
          →
        </button>

      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
          <div key={d} className="text-center text-xs font-black text-stone-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">

        {calendarDays.map((day: Date, idx: number) => {

          const dateStr = toISODate(day)
          const isSelected = selectedDate === dateStr
          const count = bookingsCountOnDay(day)
          const isToday = dateStr === today
          const inCurrentMonth = day.getMonth() === currentMonth.getMonth()

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                "aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all",
                !inCurrentMonth && "opacity-30",
                isSelected && "bg-brand-ink text-white border-brand-ink",
                isToday && !isSelected && "ring-2 ring-brand-gold ring-offset-2"
              )}
            >

              <span className="text-xl font-serif">
                {day.getDate()}
              </span>

              {count > 0 && (
                <span className={cn(
                  "text-[10px] text-white rounded-full px-1 mt-1",
                  count === 1 && "bg-red-400",
                  count === 2 && "bg-red-500",
                  count >= 3 && "bg-red-700"
                )}>
                  {count}
                </span>
              )}

            </button>
          )
        })}

      </div>

    </div>
  )
}
