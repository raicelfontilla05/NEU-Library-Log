/**
 * ADMIN.JS - Final Corrected Version
 */

// 1. MONITOR AUTHENTICATION STATE
// This handles the login/logout flow automatically
_supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth Event:", event);
    
    const allowedAdmins = ["raicel.fontilla@neu.edu.ph", "jcesperanza@neu.edu.ph"];

    // If session exists AND the email is authorized
    if (session && allowedAdmins.includes(session.user.email)) {
        console.log("Access Granted:", session.user.email);
        
        // Clean the URL hash (remove access_token from address bar)
        if (window.location.hash.includes("access_token")) {
            const cleanUrl = window.location.href.split('#')[0];
            window.history.replaceState(null, null, cleanUrl);
        }

        // Initialize the dashboard
        loadAdminData();
        setupRealtimeListener();
    } else {
        // If user is not Raicel/JC, or not logged in, boot them out
        console.warn("Unauthorized access or session expired.");
        // Use a relative path to ensure it works in the subfolder
        window.location.replace("adminLogin.html");
    }
});

// 2. REALTIME LISTENER
function setupRealtimeListener() {
    _supabase
        .channel('public:visitor_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_logs' }, () => {
            loadAdminData();
        })
        .subscribe();
}

// 3. LOAD DATA FROM SUPABASE
async function loadAdminData() {
    const { data: visitors, error } = await _supabase
        .from('visitor_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Database Error:", error);
        return;
    }

    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;

    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    tableBody.innerHTML = "";

    let stats = { Student: 0, Employee: 0, Faculty: 0 };

    visitors.forEach(v => {
        if (stats[v.user_type] !== undefined) stats[v.user_type]++;
        
        const isBlocked = blockedUsers.includes(v.email);
        const logTime = new Date(v.created_at).toLocaleString();

        tableBody.innerHTML += `
            <tr>
                <td>${v.email}</td>
                <td>${v.user_type}</td>
                <td>${v.department}</td>
                <td>${v.purpose}</td>
                <td>${logTime}</td>
                <td>
                    <button class="${isBlocked ? 'unblock-btn' : 'block-btn'}" onclick="toggleBlockUser('${v.email}')">
                        ${isBlocked ? 'Unblock' : 'Block'}
                    </button>
                </td>
            </tr>`;
    });

    // Update the UI Stats Cards
    document.getElementById("totalVisitors").innerText = visitors.length;
    document.getElementById("studentCount").innerText = stats.Student;
    document.getElementById("employeeCount").innerText = stats.Employee;
    document.getElementById("facultyCount").innerText = stats.Faculty;
}

// 4. LOGOUT FUNCTION
async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.replace("adminLogin.html");
}

// 5. DATA MANAGEMENT FUNCTIONS
function toggleBlockUser(email) {
    let blocked = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    if (blocked.includes(email)) {
        blocked = blocked.filter(e => e !== email);
    } else {
        blocked.push(email);
    }
    localStorage.setItem("blockedUsers", JSON.stringify(blocked));
    loadAdminData(); // Refresh the table
}

async function clearAllData() {
    if (confirm("Are you sure you want to delete all visitor logs? This cannot be undone.")) {
        const { error } = await _supabase.from('visitor_logs').delete().neq('email', ''); 
        if (error) {
            alert("Error clearing data: " + error.message);
        } else {
            loadAdminData();
        }
    }
}

async function exportData() {
    const { data: visitors } = await _supabase.from('visitor_logs').select('*');
    if (!visitors || visitors.length === 0) return alert("No data to export");

    const csvRows = [
        ["Email", "Type", "Department", "Purpose", "Logged At"],
        ...visitors.map(v => [
            v.email, 
            v.user_type, 
            v.department, 
            v.purpose, 
            new Date(v.created_at).toLocaleString()
        ])
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEU_Library_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function filterTable() {
    let val = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll("#visitorTable tbody tr").forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}
