async function checkAuth() {
    // 1. Immediately strip the hash if it exists to prevent 404 on refresh
    if (window.location.hash.includes("access_token")) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, null, cleanUrl);
    }

    // 2. Get the session with a fallback check
    const { data: { session }, error } = await _supabase.auth.getSession();
    
    // 3. Define allowed admins
    const allowedAdmins = ["raicel.fontilla@neu.edu.ph", "jcesperanza@neu.edu.ph"];

    // 4. Corrected Logic: Combined the conditions properly
   if (error || !session || !allowedAdmins.includes(session.user.email)) {
    // Adding the folder path here prevents the 404
    window.location.replace("https://raicelfontilla05.github.io/NEU-Library-Log/Library%20Log%20System/admin.html");
} else {
        console.log("Authenticated as:", session.user.email);
        loadAdminData();
        setupRealtimeListener();
    }
}
