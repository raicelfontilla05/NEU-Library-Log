// Database Configuration
const supabaseUrl = 'https://nukufjaarpbzyhziikpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51a3VmamFhcnBienloemlpa3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTkxOTEsImV4cCI6MjA4OTc3NTE5MX0.Q4bCPsBfFW8qXlC4odbhx1D59CU8uurdgjxBqbSF6P4';

// Use 'window._supabase' so 'admin.js' can see it easily
window._supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Navigation
function goToLogin() { location.href = "login.html"; }
function goHome() { location.href = "index.html"; }
function goToAdmin() { location.href = "adminLogin.html"; }

// --- AUTHENTICATION ---
// --- AUTHENTICATION ---
// In app.js
async function signInWithGoogle() {
    // Explicitly define the full path to avoid "state" loss during redirects
    const finalRedirect = "https://raicelfontilla05.github.io/NEU-Library-Log/Library%20Log%20System/admin.html";

    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: finalRedirect,
            // This line helps ensure the session persists correctly
            queryParams: {
                prompt: 'select_account'
            }
        }
    });

    if (error) {
        console.error("Auth Error:", error.message);
        alert("Login failed: " + error.message);
    }
}

// --- VISITOR LOGIC ---
async function processLogin() {
    // 1. Get input elements
    const emailEl = document.getElementById("user-id");
    const typeEl = document.getElementById("user-type");
    const deptEl = document.getElementById("department");
    const purposeEl = document.getElementById("purpose");
    const otherPurposeEl = document.getElementById("other-purpose");

    // 2. Validate existence of elements to prevent crashes
    if (!emailEl || !typeEl || !purposeEl) {
        console.error("Required form elements are missing from HTML.");
        return;
    }

    const email = emailEl.value.trim();
    const type = typeEl.value;
    const dept = deptEl.value || "N/A";
    const purposeInput = purposeEl.value;
    const otherPurpose = otherPurposeEl ? otherPurposeEl.value.trim() : "";

    // 3. Validation Logic
    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
    if (blockedUsers.includes(email)) {
        alert("This account has been blocked by the Administrator.");
        return;
    }

    if (!email || !type || !purposeInput) {
        alert("Please complete the form!");
        return;
    }

    // Determine final purpose string
    const finalPurpose = (purposeInput === "Others") ? otherPurpose : purposeInput;
    if (purposeInput === "Others" && !otherPurpose) {
        alert("Please specify your purpose.");
        return;
    }

    try {
        // 4. Insert into Supabase
        const { error } = await _supabase
            .from('visitor_logs')
            .insert([{ 
                email: email, 
                user_type: type, 
                department: dept, 
                purpose: finalPurpose 
            }]);

        if (error) throw error;

        // 5. Save data for the welcome page to read
        const loginData = {
            email: email,
            department: dept,
            purpose: finalPurpose,
            time: new Date().toLocaleTimeString() + " | " + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };
        localStorage.setItem("latestVisitor", JSON.stringify(loginData));

        // 6. Redirect
        window.location.href = "./welcome.html"; 
    } catch (err) {
        console.error("Database Error:", err.message);
        alert("System error: " + err.message);
    }
}

// --- UI UTILITIES ---
function updateClock(id) {
    const d = new Date();
    const el = document.getElementById(id);
    if (el) {
        el.innerText = d.toLocaleTimeString() + " | " + d.toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
}

function toggleAdmin() { 
    const drop = document.getElementById("adminDropdown");
    if (drop) drop.classList.toggle("show"); 
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove("show"));
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.zIndex = "1");
}

function toggleDropdownElement(menuId) {
    const m = document.getElementById(menuId);
    if (!m) return;
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
    const label = document.getElementById("selectedUserType");
    const input = document.getElementById("user-type");
    if (label) label.innerText = v;
    if (input) input.value = v;
    closeAllDropdowns();
}

function selectDepartment(v) {
    const label = document.getElementById("selectedDepartment");
    const input = document.getElementById("department");
    if (label) label.innerText = v;
    if (input) input.value = v;
    closeAllDropdowns();
}

function selectPurpose(v) {
    const label = document.getElementById("selectedPurpose");
    const input = document.getElementById("purpose");
    if (label) label.innerText = v;
    if (input) input.value = v;
    
    const otherGroup = document.getElementById("other-purpose-group");
    if (otherGroup) {
        otherGroup.style.display = (v === "Others") ? "block" : "none";
    }
    closeAllDropdowns();
}

// Handle clicks outside of dropdowns to close them
window.onclick = function(e) {
    if (!e.target.closest('.custom-dropdown') && !e.target.closest('.admin-container')) {
        closeAllDropdowns();
        const adminDrop = document.getElementById("adminDropdown");
        if(adminDrop) adminDrop.classList.remove("show");
    }
};
