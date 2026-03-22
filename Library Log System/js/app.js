// Database Configuration
const supabaseUrl = 'https://nukufjaarpbzyhziikpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3VmamFhcnBienloemlpa3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTkxOTEsImV4cCI6MjA4OTc3NTE5MX0.Q4bCPsBfFW8qXlC4odbhx1D59CU8uurdgjxBqbSF6P4';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Navigation
function goToLogin() { location.href = "login.html"; }
function goHome() { location.href = "index.html"; }
function goToAdmin() { location.href = "adminLogin.html"; }

// --- AUTHENTICATION ---
async function signInWithGoogle() {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://raicelfontilla05.github.io/NEU-Library-Log/Library%20Log%20System/admin.html'
        }
    });
    if (error) alert("Login failed: " + error.message);
}

async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.replace("adminLogin.html");
}

// --- VISITOR LOGIC ---
async function processLogin() {
    const email = document.getElementById("user-id").value;
    const type = document.getElementById("user-type").value;
    const dept = document.getElementById("department").value;
    const purposeInput = document.getElementById("purpose").value;
    const otherPurpose = document.getElementById("other-purpose")?.value || "";

    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    if (blockedUsers.includes(email)) {
        alert("This account has been blocked by the Administrator.");
        return;
    }

    if (!email || !type || !purposeInput) {
        alert("Please complete the form!");
        return;
    }

    const finalPurpose = (purposeInput === "Others") ? otherPurpose : purposeInput;

    try {
        const { error } = await _supabase
            .from('visitor_logs')
            .insert([{ email, user_type: type, department: dept, purpose: finalPurpose }]);

        if (error) throw error;

        // Save for welcome.js to read
        const logTime = new Date().toLocaleString();
        let logs = JSON.parse(localStorage.getItem("visitorLogs") || "[]");
        logs.push({ email, department: dept, purpose: finalPurpose, time: logTime });
        localStorage.setItem("visitorLogs", JSON.stringify(logs));

        window.location.href = "welcome.html"; 
    } catch (err) {
        console.error("Database Error:", err.message);
        alert("System error: " + err.message);
    }
}

// --- UI UTILITIES ---
function updateClock(id) {
    const d = new Date();
    const el = document.getElementById(id);
    if (el) el.innerText = d.toLocaleTimeString() + " | " + d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function toggleAdmin() { document.getElementById("adminDropdown").classList.toggle("show"); }

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove("show"));
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.zIndex = "1");
}

function toggleDropdownElement(menuId) {
    const m = document.getElementById(menuId);
    const isOpen = m.classList.contains("show");
    closeAllDropdowns();
    if (!isOpen) {
        m.classList.add("show");
        const container = m.closest('.custom-dropdown');
        if (container) container.style.zIndex = "999";
    }
}

function toggleUserTypeDropdown() { toggleDropdownElement("userTypeMenu"); }
function toggleDepartmentDropdown() { toggleDropdownElement("departmentMenu"); }
function toggleDropdown() { toggleDropdownElement("dropdownMenu"); }

function selectUserType(v) {
    document.getElementById("selectedUserType").innerText = v;
    document.getElementById("user-type").value = v;
    const deptGroup = document.getElementById("dept-input-group");
    if (deptGroup) deptGroup.style.display = (v === "Student") ? "block" : "none";
    closeAllDropdowns();
}

function selectDepartment(v) {
    document.getElementById("selectedDepartment").innerText = v;
    document.getElementById("department").value = v;
    closeAllDropdowns();
}

function selectPurpose(v) {
    document.getElementById("selectedPurpose").innerText = v;
    document.getElementById("purpose").value = v;
    const otherGroup = document.getElementById("other-purpose-group");
    if (otherGroup) otherGroup.style.display = (v === "Others") ? "block" : "none";
    closeAllDropdowns();
}

window.onclick = function(e) {
    if (!e.target.closest('.custom-dropdown') && !e.target.closest('.admin-container')) {
        closeAllDropdowns();
        const adminDrop = document.getElementById("adminDropdown");
        if(adminDrop) adminDrop.classList.remove("show");
    }
};
