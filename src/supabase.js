import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cjyfptswbsircpgiwffo.supabase.co'
const SUPABASE_KEY = 'sb_publishable_fdCAO9w-RUJibuE5MAiZHw_3U0qwapL'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
