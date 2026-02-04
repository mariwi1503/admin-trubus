import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://eqrloklnuihnqaxoojxo.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImEwOGJmY2YwLWVjMTItNGEwMi1hMDBmLWMzY2VkOGExZjk0NCJ9.eyJwcm9qZWN0SWQiOiJlcXJsb2tsbnVpaG5xYXhvb2p4byIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwMTYyMDk3LCJleHAiOjIwODU1MjIwOTcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.XiQvVl3JGILrCCyb3NSG2J7IF1P07pXNes5FjlT4GvI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };