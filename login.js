const loginForm = document.getElementById("loginForm");
const loginErrorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]");

        if (!Array.isArray(users)) {
            throw new Error("Saved user data is not a list.");
        }

        const legacyName = localStorage.getItem("name");
        const legacyEmail = localStorage.getItem("email");
        const legacyPassword = localStorage.getItem("password");
        const allUsers = users.slice();

        if (legacyName && legacyEmail && legacyPassword) {
            allUsers.push({
                name: legacyName,
                email: legacyEmail,
                password: legacyPassword
            });
        }

        const normalizedUsername = username.toLowerCase();
        const user = allUsers.find(account => {
            const nameMatches =
                String(account.name || "").toLowerCase() === normalizedUsername;
            const emailMatches =
                String(account.email || "").toLowerCase() === normalizedUsername;
            return (nameMatches || emailMatches) &&
                account.password === password;
        });

        if (!user) {
            loginErrorMessage.textContent =
                "Invalid username/email or password.";
            loginErrorMessage.style.color = "red";
            return;
        }

        sessionStorage.setItem("libraryLoggedInUser", JSON.stringify({
            name: user.name,
            email: user.email
        }));
        window.location.href = "dashboard.html";
    } catch (error) {
        loginErrorMessage.textContent =
            "Unable to complete login. Check that Local Storage is enabled.";
        loginErrorMessage.style.color = "red";
    }
});
