import { createClient } from '@supabase/supabase-js';
import type { Promotion } from '../types';

const supabaseUrl = 'https://rhankqhcbofqoxooeyjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYW5rcWhjYm9mcW94b29leWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mjg4NjEsImV4cCI6MjA3NjEwNDg2MX0.pYfn0aA4Ln-i1HSD4R9z4CTKL8HUk9L11Ud414v0Too';

// The 'Promotion' type from the database has a `created_at` field
// which is not part of the local `Promotion` type used in the app.
// We select all columns but our app will only use the ones defined in the local type.
export const supabase = createClient(supabaseUrl, supabaseKey);
