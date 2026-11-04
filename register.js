const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.style.color = "red";
        return;
    }

    try {
        const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]");

        if (!Array.isArray(users)) {
            throw new Error("Saved user data is not a list.");
        }

        if (users.some(user =>
            String(user.email).toLowerCase() === email.toLowerCase()
        )) {
            registerMessage.textContent =
                "An account with this email already exists.";
            registerMessage.style.color = "red";
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem("libraryUsers", JSON.stringify(users));

        registerMessage.textContent =
            "Registration successful. You can now log in.";
        registerMessage.style.color = "green";
        registerForm.reset();
    } catch (error) {
        registerMessage.textContent =
            "Unable to save the account in Local Storage.";
        registerMessage.style.color = "red";
    }
});
