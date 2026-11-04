
const defaultBooks = [
    { id: "B001", name: "JavaScript Basics", quantity: 5 },
    { id: "B002", name: "HTML and CSS", quantity: 3 },
    { id: "B003", name: "Python Programming", quantity: 4 },
    { id: "B004", name: "Database Management", quantity: 2 }
];

const defaultMembers = [
    { id: "M001", name: "Arun Kumar" },
    { id: "M002", name: "Priya Devi" },
    { id: "M003", name: "Karthik Raj" },
    { id: "M004", name: "Divya Sri" }
];

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        if (data === null) return fallback;

        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

let books = loadData("libraryBooks", defaultBooks);
let members = loadData("libraryMembers", defaultMembers);
let issues = loadData("libraryIssues", []);

function saveData() {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
    localStorage.setItem("libraryMembers", JSON.stringify(members));
    localStorage.setItem("libraryIssues", JSON.stringify(issues));
}

function getDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
}

function showMessage(text, type) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.className = "message " + type;
}

function renderIssuedBooks() {
    const select = document.getElementById("issuedBook");
    const activeIssues = issues.filter(i => i.status === "Issued");

    select.innerHTML = '<option value="">Select an issued book</option>';

    activeIssues.forEach((issue, index) => {
        const option = document.createElement("option");
        option.value = String(issues.indexOf(issue));
        option.textContent =
            `${issue.bookName} — ${issue.memberName} (${issue.issueDate})`;
        select.appendChild(option);
    });

    if (activeIssues.length === 0) {
        select.innerHTML =
            '<option value="">No books currently issued</option>';
    }
}

function renderReports() {
    const totalBooks = books.reduce(
        (sum, book) => sum + book.quantity, 0
    );

    const issued = issues.filter(
        issue => issue.status === "Issued"
    ).length;

    document.getElementById("totalBooks").textContent =
        totalBooks + issued;

    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("availableBooks").textContent =
        totalBooks;

    document.getElementById("issuedBooks").textContent =
        issued;

    const table = document.getElementById("reportTable");

    if (issues.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px">
                    No issue records available.
                </td>
            </tr>`;
    } else {
        table.innerHTML = issues.slice().reverse().map(issue => `
            <tr>
                <td>${escapeHTML(issue.memberName)}</td>
                <td>${escapeHTML(issue.bookName)}</td>
                <td>${escapeHTML(issue.issueDate)}</td>
                <td>${escapeHTML(issue.returnDate)}</td>
                <td>
                    <span class="status ${issue.status === "Returned" ? "returned" : ""}">
                        ${escapeHTML(issue.status)}
                    </span>
                </td>
            </tr>
        `).join("");
    }

    document.getElementById("reportCount").textContent =
        `${issues.length} issue record(s)`;

    renderIssuedBooks();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.getElementById("returnDate").value = getDate();
document.getElementById("returnDate").max = getDate();

document.getElementById("returnForm").addEventListener("submit", event => {
    event.preventDefault();

    const selectedIndex = document.getElementById("issuedBook").value;
    const returnDate = document.getElementById("returnDate").value;

    if (selectedIndex === "") {
        showMessage("Please select an issued book.", "error");
        return;
    }

    const issue = issues[Number(selectedIndex)];

    if (!issue || issue.status !== "Issued") {
        showMessage("This issue record is no longer active.", "error");
        renderReports();
        return;
    }

    if (!returnDate || returnDate < issue.issueDate ||
        returnDate > getDate()) {
        showMessage(
            "Enter a valid return date between the issue date and today.",
            "error"
        );
        return;
    }

    const book = books.find(b => b.id === issue.bookId);

    if (!book) {
        showMessage(
            "Book record not found. Please check your library data.",
            "error"
        );
        return;
    }

    book.quantity++;
    issue.status = "Returned";
    issue.actualReturnDate = returnDate;

    // Update the return date displayed in the report.
    issue.returnDate = returnDate;

    saveData();
    renderReports();

    document.getElementById("returnForm").reset();
    document.getElementById("returnDate").value = getDate();

    showMessage(
        `Book "${issue.bookName}" returned successfully by ${issue.memberName}.`,
        "success"
    );
});

document.getElementById("returnForm").addEventListener("reset", () => {
    setTimeout(() => {
        document.getElementById("message").textContent = "";
        document.getElementById("message").className = "message";
        document.getElementById("returnDate").value = getDate();
    }, 0);
});

renderReports();
