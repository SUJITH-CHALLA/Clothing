import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // using service role to bypass RLS for checking the table structure/issue
);

async function testWishlist() {
    // 1. Check if wishlist table exists
    const { data: cols, error: colErr } = await supabase
        .from('wishlist')
        .select('*')
        .limit(1);

    if (colErr) {
        console.error("Error accessing wishlist:", colErr);
    } else {
        console.log("Wishlist table exists. Sample data:", cols);
    }

    // 2. Check profiles
    const { data: profiles } = await supabase.from('profiles').select('id, email').limit(5);
    console.log("Profiles in DB:", profiles);
}

testWishlist();
