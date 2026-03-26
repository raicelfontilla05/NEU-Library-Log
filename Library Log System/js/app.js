// Database Configuration
const supabaseUrl = 'https://nukufjaarpbzyhziikpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3VmamFhcnBienloemlpa3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTkxOTEsImV4cCI6MjA4OTc3NTE5MX0.Q4bCPsBfFW8qXlC4odbhx1D59CU8uurdgjxBqbSF6P4';

// Initialize Supabase Client
window._supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Navigation Functions
function goToLogin() { location.href = "login.html"; }
function goHome() { location.href = "index.html"; }
function goToAdmin() { location.href = "adminLogin.html"; }

// --- AUTHENTICATION ---
async function signInWithGoogle() {
    // Exact path for your GitHub Pages structure
    const redirectUrl = "https://raicelfontilla05.github.io/NEU-Library-Log/Library%20Log%20System/admin.html";
    
    console.log("Redirecting to:", redirectUrl);

    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl
        }
    });
    if (error) alert("Login failed: " + error.message);
}

// --- VISITOR LOGIC ---
async function processLogin() {
    const emailEl = document.getElementById("user-id");
    const typeEl = document.getElementById("user-type");
    const deptEl = document.getElementById("department");
    const purposeEl = document.getElementById("purpose");
    const otherPurposeEl = document.getElementById("other-purpose");

    if (!emailEl || !typeEl || !purposeEl) return;

    const email = emailEl.value.trim();
    const type = typeEl.value;
    const dept = deptEl.value || "N/A";
    const purposeInput = purposeEl.value;
    const otherPurpose = otherPurposeEl ? otherPurposeEl.value.trim() : "";

    // Check if blocked
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

        // Save data for welcome.html
        const loginData = {
            email,
            department: dept,
            purpose: finalPurpose,
            time: new Date().toLocaleTimeString() + " | " + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };
        localStorage.setItem("latestVisitor", JSON.stringify(loginData));

        window.location.href = "welcome.html"; 
    } catch (err) {
        alert("Database Error: " + err.message);
    }
}

// UI Utilities
function updateClock(id) {
    const el = document.getElementById(id);
    if (el) {
        const d = new Date();
        el.innerText = d.toLocaleTimeString() + " | " + d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function toggleAdmin() { document.getElementById("adminDropdown")?.classList.toggle("show"); }

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove("show"));
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.zIndex = "1");
}

function selectUserType(v) {
    document.getElementById("selectedUserType").innerText = v;
    document.getElementById("user-type").value = v;
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
        document.getElementById("adminDropdown")?.classList.remove("show");
    }
};
