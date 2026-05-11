import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const PUSH_TARGET_CACHE = 'rosa-maria-push-target'
const PUSH_TARGET_KEY = '/latest'

function openPushTarget(value: unknown) {
  if (typeof value !== 'string') return
  if (!value.startsWith('/admin')) return

  window.location.assign(value)
