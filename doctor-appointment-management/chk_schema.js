require('dotenv').config({path: '.env.local'})
const { createClient } = require('@supabase/supabase-js')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
async function run() {
  const { data, error } = await sb.from('patients').select('*').limit(1)
  if (error) console.error(error)
  else console.log("Columns:", Object.keys(data[0] || {}))
}
run()
