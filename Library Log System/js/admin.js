async function checkAuth() {
    if (window.location.hash.includes("access_token")) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, null, cleanUrl);
    }

    const { data: { session }, error } = await _supabase.auth.getSession();
    const allowedAdmins = ["raicel.fontilla@neu.edu.ph", "jcesperanza@neu.edu.ph"];

    if (error || !session || !allowedAdmins.includes(session.user.email)) {
        console.log("Auth Failed. Redirecting...");
        window.location.replace("https://raicelfontilla05.github.io/NEU-Library-Log/Library%20Log%20System/adminLogin.html");
    } else {
        console.log("Authenticated as:", session.user.email);
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
    blocked = blocked.includes(email) ? blocked.filter(e => e !== email) : [...blocked, email];
    localStorage.setItem("blockedUsers", JSON.stringify(blocked));
    loadAdminData();
}

function filterTable() {
    let val = document.getElementById("searchInput").value.toLowerCase();
    document.querySelectorAll("#visitorTable tbody tr").forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(val) ? "" : "none";
    });
}

// RUN THE CHECK
checkAuth();
