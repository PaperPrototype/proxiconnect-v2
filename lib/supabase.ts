
import { createClient } from "@supabase/supabase-js";

const VITE_SUPABASE_URL="https://telnhomtoktvyzpnzxgq.supabase.co"
const VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbG5ob210b2t0dnl6cG56eGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTk4ODcsImV4cCI6MjA3NDU3NTg4N30.CGLk3rtzima8-JNvI2g8x6X0qv6j9MxVAdG9YzoGA6s"

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

export default supabase;