const SUPABASE_URL = 'https://tirkqybcedxfusifslim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcmtxeWJjZWR4ZnVzaWZzbGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjA4NDcsImV4cCI6MjA5MDQzNjg0N30.EQufAux8VmjAzDeIj8MrmqXaIDBfsCpbj2FUS60e5-8';

async function loadAndInitHeader() {
    try {
        // 1. Load header HTML first
        const res = await fetch('header.html');
        const html = await res.text();
        document.getElementById('header').innerHTML = html;

        // 2. Wire up hamburger + scroll button immediately
        document.getElementById('hamburger')?.addEventListener('click', () => {
            document.getElementById('navMenu')?.classList.toggle('active');
        });

        document.getElementById('scrollTopBtn')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // 3. Now handle auth - wait for supabase to exist
        if (typeof supabase === 'undefined') {
            console.error('Supabase not loaded');
            return;
        }

        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        const adminLinkContainer = document.getElementById('adminLinkContainer');
        const loginLogoutLink = document.getElementById('loginLogoutLink');

        if (user) {
            console.log('User logged in:', user.id);
            loginLogoutLink.textContent = 'Sign Out';
            loginLogoutLink.href = '#';
            loginLogoutLink.onclick = async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                window.location.href = 'login.html';
            };

            // Check admin role
          const { data: profileData } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

            console.log('Profile data:', profileData, error);

            if (profileData && profileData.role === 'admin') {
                adminLinkContainer.innerHTML = '<a href="admin_dashboard.html">Admin Portal</a>';
                console.log('Admin link added');
            }
        } else {
            console.log('No user logged in');
            loginLogoutLink.textContent = 'Client Login';
            loginLogoutLink.href = 'login.html';
        }
    } catch (err) {
        console.error('Header init error:', err);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', loadAndInitHeader);
