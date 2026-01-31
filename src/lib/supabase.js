// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rdkqxpgsvwqljqyffrjw.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka3F4cGdzdndxbGpxeWZmcmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Njc4NzQsImV4cCI6MjA4NDI0Mzg3NH0.pQpMTui1u1c9QgUiuS503egWnT_wiQTNZTOS8zOw-lg'

console.log('Supabase URL:', supabaseUrl ? '✓ Configurada' : '✗ No configurada')
console.log('Supabase Key:', supabaseAnonKey ? '✓ Configurada' : '✗ No configurada')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)