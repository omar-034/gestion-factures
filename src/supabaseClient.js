import { createClient } from '@supabase/supabase-js'

// REMPLACEZ ces valeurs par les vôtres de l'étape 3
const supabaseUrl = 'https://bxgyadlbugzdabwfztvo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lhZGxidWd6ZGFid2Z6dHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNjA0NTEsImV4cCI6MjA3ODczNjQ1MX0.U93DS3Xm1pnBuP_wvIrtkgptKuyxni6SZ-TiLPII8QE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)