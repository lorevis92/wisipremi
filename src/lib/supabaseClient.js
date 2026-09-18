import { createClient } from "@supabase/supabase-js";

// Client lato browser: SOLO anon key, mai la service role key qui.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
