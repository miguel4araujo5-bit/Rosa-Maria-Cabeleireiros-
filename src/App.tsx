import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Check, MessageSquare, Menu, X, RefreshCw, Phone, Instagram, LogOut } from 'lucide-react'
import { api } from './services/api'
import type { Appointment } from './types'
import Logo from './Logo'

type AvailabilitySlot = {
  date: string
  time: string
  status: 'por_confirmar' | 'confirmado' | 'bloqueado'
}

const ADMIN_PATH = '/admin'
const MANAGER_WHATSAPP = '351932939817'

const SERVICES = [
  { id: 'corte_mulher', label: 'Corte Mulher', category: 'Cortes' },
  { id: 'corte_homem', label: 'Corte Homem', category: 'Cortes' },
  { id: 'brushing', label: 'Brushing', category: 'Styling' },
  { id: 'tratamento', label: 'Tratamento Capilar', category: 'Tratamentos' },
  { id: 'coloracao', label: 'Coloração', category: 'Cor' },
  { id: 'madeixas', label: 'Madeixas', category: 'Cor' },
  { id: 'alisamento', label: 'Alisamento / Queratina', category: 'Tratamentos' },
  { id: 'outro', label: 'Outro', category: 'Outros' },
] as const

const SERVICE_CATEGORIES = Array.from(new Set(SERVICES.map(s => s.category)))

const TIMES = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00',
] as const

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function isClosedDayISO(dateISO: string) {
  if (!dateISO) return false
  const d = new Date(`${dateISO}T00:00:00`)
  const day = d.getDay()
  return day === 0 || day === 1
}

function normalizePhone(raw: string) {
  const s = String(raw || '').trim()
  const digits = s.replace(/[^\d+]/g, '')
  if (!digits) return ''
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('351')) return `+${digits}`
  if (digits.startsWith('0')) return `+351${digits.slice(1)}`
  if (digits.length === 9) return `+351${digits}`
  return digits
}

function waLink(phoneRaw: string, message: string) {
  const phone = normalizePhone(phoneRaw).replace('+', '')
  const text = encodeURIComponent(message)
  if (!phone) return `https://wa.me/?text=${text}`
  return `https://wa.me/${phone}?text=${text}`
}

function safeParseServices(services: unknown) {
  try {
    if (Array.isArray(services)) return services.map(String)
    if (typeof services === 'string') {
      const trimmed = services.trim()
      if (!trimmed) return []
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map(String)
      return [trimmed]
    }
    return []
  } catch {
    return typeof services === 'string' && services ? [services] : []
  }
}

function serviceLabels(ids: string[]) {
  const map = new Map(SERVICES.map((s) => [s.id, s.label] as const))
  return ids.map((id) => map.get(id) || id)
}

function toPTDateLabel(dateISO: string) {
  if (!dateISO) return ''
  const d = new Date(`${dateISO}T00:00:00`)
  const fmt = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  return fmt.format(d).replace('.', '')
}

function monthTitle(d: Date) {
  const fmt = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' })
  const s = fmt.format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
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
  return new Date(d.getFullYear(), d.getMonth()+1, 0)
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  return addDays(x, diff)
}

function endOfWeekMonday(d: Date) {
  return addDays(startOfWeekMonday(d), 6)
}

function daysBetweenInclusive(start: Date, end: Date) {
  const out: Date[] = []
  let cur = new Date(start)
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return out
}
