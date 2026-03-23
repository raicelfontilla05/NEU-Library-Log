document.addEventListener("DOMContentLoaded", () => {
    // Pull the data we just saved during the processLogin function
    const data = JSON.parse(localStorage.getItem("latestVisitor"));
    
    if (data) {
        document.getElementById("display-email").innerText = data.email;
        document.getElementById("display-dept").innerText = data.department;
        document.getElementById("display-purpose").innerText = data.purpose;
        document.getElementById("display-time").innerText = data.time;
    } else {
        // Fallback if someone navigates here directly without logging in
        document.querySelector(".welcome-details").innerHTML = "<p style='color:red;'>No recent login data found.</p>";
    }
});

function goHome() { 
    // Clear the temporary storage when they are done
    localStorage.removeItem("latestVisitor");
    window.location.href = "index.html"; 
}
