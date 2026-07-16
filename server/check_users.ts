import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
supabase.from('users').select('*').limit(1).then(res => console.log(JSON.stringify(res, null, 2)));
