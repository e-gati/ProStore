import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cjyfptswbsircpgiwffo.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWZwdHN3YnNpcmNwZ2l3ZmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTM4MTAsImV4cCI6MjA5MzA2OTgxMH0.k3pw9Cff133QiovyBY-6UqWa3F_tvvBgLOEIxhM7ejc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
