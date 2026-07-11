import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY
const bucket = process.env.SUPABASE_BUCKET

if (!url) throw new Error('Missing environment variable: SUPABASE_URL')
if (!key) throw new Error('Missing environment variable: SUPABASE_KEY')
if (!bucket) throw new Error('Missing environment variable: SUPABASE_BUCKET')

export const supabaseClient = createClient(url, key)
export const supabaseBucket = bucket
