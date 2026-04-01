const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getTestUccn() {
  const { data, error } = await supabase
    .from('patients')
    .select('unique_citizen_card_number')
    .not('unique_citizen_card_number', 'is', null)
    .limit(1)

  if (error) {
    console.error('Error fetching UCCN:', error)
  } else {
    console.log('Test UCCN:', data[0]?.unique_citizen_card_number)
  }
}

getTestUccn()
