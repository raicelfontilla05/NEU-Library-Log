# NEU-Library-Log

# 🏛️ NEU Library Visitor Log

**Live Application:** [Insert Live Deployed Link Here]  
**GitHub Repository:** [Insert GitHub Repo Link Here]

The **NEU Library Visitor Log** is a centralized, secure, and user-friendly system designed to track, manage, and analyze library visits by students, faculty members, and employees at New Era University (NEU). It streamlines the entry process and equips the library administration with powerful statistical insights.

---

## ✨ Features

### 📥 Visitor Input & Authentication
* **Quick ID Tap:** Visitors can simply tap their ID to log their entry.
* **Google OAuth Integration:** Alternatively, users can securely log in using their NEU Institutional Google account.
* **Visit Purpose:** Upon entry, visitors are prompted to select their reason for visiting (e.g., *Reading, Researching, Use of Computer, or Assignments*).

### 🖥️ User Experience (Regular User)
* **Personalized Welcome:** Upon a successful login/tap, the system displays a personalized message: *"Welcome to NEU Library!"* along with the visitor's name, date/time of login, and their respective college or office.

### 🔐 Role-Based Access Control (RBAC) & Admin Capabilities
* **Secure Role Switching:** Built with robust RBAC, the system allows authorized accounts (such as `jcesperanza@neu.edu.ph`) to safely toggle between **Regular User** and **Admin** roles without compromising session security.
* **Admin Dashboard:** A responsive dashboard featuring statistical cards that track the number of visitors over specific timeframes (Daily, Weekly, Monthly, or a custom Date Range).
* **Advanced Filtering:** Admins can filter visitor statistics by:
    * Reason for visiting
    * College/Department
    * User Type (Student vs. Employee/Teacher/Staff)
* **User Management:** Admins possess the authority to block specific users from the system if necessary.

---

## 🛠️ Technology Stack
* **IDE:** Visual Studio
* **Local Server / Database:** Laragon (MySQL/Apache)
* **Authentication:** Google Identity Services (OAuth 2.0)

---

## 🚀 Local Development Setup

### Prerequisites
1. Install [Laragon](https://laragon.org/).
2. Install [Visual Studio](https://visualstudio.microsoft.com/).
3. Set up a Google Cloud Console project for Google OAuth credentials.

### Installation Steps
1. **Clone the repository:**
   ```bash
   git clone [Insert GitHub Repo Link Here]
