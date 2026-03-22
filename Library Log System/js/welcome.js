document.addEventListener("DOMContentLoaded", () => {
    const logs = JSON.parse(localStorage.getItem("visitorLogs")) || [];
    if (logs.length > 0) {
        const user = logs[logs.length - 1];
        document.getElementById("display-email").innerText = user.email;
        document.getElementById("display-dept").innerText = user.department;
        document.getElementById("display-purpose").innerText = user.purpose;
        document.getElementById("display-time").innerText = user.time;
    }
});

function goHome() { window.location.href = "index.html"; }