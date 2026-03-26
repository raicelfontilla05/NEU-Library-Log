// admin.js
async function checkAuth() {
    // 1. If there's a token in the URL, this cleans it up
    if (window.location.hash.includes("access_token")) {
        // Use a safer way to clean the URL without losing the path
        const cleanUrl = window.location.href.split('#')[0];
        window.history.replaceState(null, null, cleanUrl);
    }

    const { data: { session }, error } = await _supabase.auth.getSession();
    
    // 2. Your email IS on this list (raicel.fontilla@neu.edu.ph), so this is correct.
    const allowedAdmins = ["raicel.fontilla@neu.edu.ph", "jcesperanza@neu.edu.ph"];

    if (error || !session || !allowedAdmins.includes(session.user.email)) {
        console.log("Auth failed or user not on list");
        window.location.replace("adminLogin.html");
    } else {
        console.log("Welcome, Admin!");
        loadAdminData();
        setupRealtimeListener();
    }
}

function setupRealtimeListener() {
    _supabase
        .channel('public:visitor_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_logs' }, () => {
            loadAdminData();
        })
        .subscribe();
}

async function loadAdminData() {
    const { data: visitors, error } = await _supabase
        .from('visitor_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error("Error:", error);

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

    document.getElementById("totalVisitors").innerText = visitors.length;
    document.getElementById("studentCount").innerText = stats.Student;
    document.getElementById("employeeCount").innerText = stats.Employee;
    document.getElementById("facultyCount").innerText = stats.Faculty;
}

function toggleBlockUser(email) {
    let blocked = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    if (blocked.includes(email)) {
        blocked = blocked.filter(e => e !== email);
    } else {
        blocked.push(email);
    }
    localStorage.setItem("blockedUsers", JSON.stringify(blocked));
    loadAdminData();
}

async function clearAllData() {
    if (confirm("Are you sure you want to delete all visitor logs from the database?")) {
        const { error } = await _supabase.from('visitor_logs').delete().neq('email', ''); 
        if (error) alert(error.message);
        loadAdminData();
    }
}

async function exportData() {
    const { data: visitors } = await _supabase.from('visitor_logs').select('*');
    if (!visitors || visitors.length === 0) return alert("No data to export");

    const csvRows = [
        ["Email", "Type", "Department", "Purpose", "Logged At"],
        ...visitors.map(v => [v.email, v.user_type, v.department, v.purpose, new Date(v.created_at).toLocaleString()])
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEU_Library_Logs_${new Date().toLocaleDateString()}.csv`;
    a.click();
}

function filterTable() {
    let val = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll("#visitorTable tbody tr").forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}

checkAuth();
