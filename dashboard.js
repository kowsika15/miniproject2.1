const pageContent = document.getElementById("pageContent");
const menuItems = document.querySelectorAll(".menu");
const BOOKS_KEY = "libraryBooks";
const MEMBERS_KEY = "libraryMembers";
const LOANS_KEY = "libraryLoans";
const RETURNS_KEY = "libraryReturns";

if (!sessionStorage.getItem("libraryLoggedInUser")) {
    window.location.replace("login.html");
}

function readList(key) {
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const value = JSON.parse(stored);
    if (!Array.isArray(value)) {
        throw new Error(`Saved data for ${key} is not a list.`);
    }

    return value;
}

function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

function getLibraryData() {
    return {
        books: readList(BOOKS_KEY),
        members: readList(MEMBERS_KEY),
        loans: readList(LOANS_KEY),
        returns: readList(RETURNS_KEY)
    };
}

function saveDashboardData(entries) {
    const previousValues = entries.map(([key]) => [
        key,
        localStorage.getItem(key)
    ]);

    try {
        entries.forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    } catch (error) {
        previousValues.forEach(([key, value]) => {
            try {
                if (value === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, value);
                }
            } catch (rollbackError) {
                console.error(`Unable to restore ${key} after a save failure.`, rollbackError);
            }
        });
        throw error;
    }
}

function renderDashboard() {
    const { books, members, loans, returns } = getLibraryData();
    const totalBooks = books.reduce(
        (total, book) => total + (Number(book.quantity) || 0), 0
    );
    const totalIssued = loans.length;

    return `
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome to Digital Library Management System</p>
        <div class="cards">
            <div class="card blue"><span>📚</span><h3>Total Books</h3><p>${totalBooks}</p></div>
            <div class="card green"><span>👥</span><h3>Total Members</h3><p>${members.length}</p></div>
            <div class="card orange"><span>📖</span><h3>Books Issued</h3><p>${totalIssued}</p></div>
            <div class="card red"><span>↩</span><h3>Books Returned</h3><p>${returns.length}</p></div>
        </div>
        <section class="panel">
            <h2>Library Overview</h2>
            <p>Manage books, members, issue records, returns and reports from one place.</p>
        </section>
        <section class="panel">
            <h2>Quick Navigation</h2>
            <div class="quick-links">
                <a class="dashboard-link" href="book1.html">View Books</a>
                <a class="dashboard-link" href="members.html">View Members</a>
                <button data-go="Issue Book">Issue a Book</button>
                <button data-go="Reports">View Reports</button>
            </div>
        </section>`;
}

function renderIssuePage() {
    const { books, members } = getLibraryData();
    const availableBooks = books.filter(book => Number(book.quantity) > 0);
    const bookOptions = availableBooks.map(book =>
        `<option value="${escapeHTML(book.bookId)}">${escapeHTML(book.bookName)} (${escapeHTML(book.bookId)}; ${Number(book.quantity)} available)</option>`
    ).join("");
    const memberOptions = members.map(member =>
        `<option value="${escapeHTML(member.memberId)}">${escapeHTML(member.name)} (${escapeHTML(member.memberId)})</option>`
    ).join("");

    return `
        <h1>Issue Book</h1>
        <p class="subtitle">Issue an available book to a registered member</p>
        <section class="panel">
            <h2>Issue Book Form</h2>
            <form id="issueForm" class="dashboard-form">
                <label for="issueMember">Member</label>
                <select id="issueMember" name="memberId" required>${memberOptions}</select>
                <label for="issueBook">Available book</label>
                <select id="issueBook" name="bookId" required>${bookOptions}</select>
                <label for="issueDate">Issue date</label>
                <input id="issueDate" type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}">
                <button type="submit" ${!memberOptions || !bookOptions ? "disabled" : ""}>Issue Book</button>
            </form>
            <p id="issueMessage" role="status" aria-live="polite">${!members.length ? "Add a member before issuing a book." : !availableBooks.length ? "No books are currently available to issue." : ""}</p>
        </section>`;
}

function renderReturnPage() {
    const { loans } = getLibraryData();
    const loanOptions = loans.map(loan =>
        `<option value="${escapeHTML(loan.loanId)}">${escapeHTML(loan.bookName)} — ${escapeHTML(loan.memberName)} (issued ${escapeHTML(loan.issueDate)})</option>`
    ).join("");

    return `
        <h1>Return Book</h1>
        <p class="subtitle">Record a return for an issued book</p>
        <section class="panel">
            <h2>Return Book Form</h2>
            <form id="returnForm" class="dashboard-form">
                <label for="returnLoan">Issued book</label>
                <select id="returnLoan" name="loanId" required>${loanOptions}</select>
                <button type="submit" ${loans.length === 0 ? "disabled" : ""}>Return Book</button>
            </form>
            <p id="returnMessage" role="status" aria-live="polite">${loans.length ? "" : "There are no books currently issued."}</p>
        </section>`;
}

function renderReports() {
    const { books, members, loans, returns } = getLibraryData();
    const copiesAvailable = books.reduce(
        (total, book) => total + (Number(book.quantity) || 0), 0
    );

    return `
        <h1>Library Reports</h1>
        <p class="subtitle">Current library activity summary</p>
        <div class="cards">
            <div class="card blue"><h3>Available Copies</h3><p>${copiesAvailable}</p></div>
            <div class="card green"><h3>Members</h3><p>${members.length}</p></div>
            <div class="card orange"><h3>Books Issued</h3><p>${loans.length}</p></div>
            <div class="card red"><h3>Books Returned</h3><p>${returns.length}</p></div>
        </div>
        <section class="panel">
            <h2>Issued Books</h2>
            ${loans.length ? `<div class="table-wrapper"><table class="data-table"><thead><tr><th>Book</th><th>Member</th><th>Issue Date</th></tr></thead><tbody>${loans.map(loan => `<tr><td>${escapeHTML(loan.bookName)}</td><td>${escapeHTML(loan.memberName)}</td><td>${escapeHTML(loan.issueDate)}</td></tr>`).join("")}</tbody></table></div>` : "<p>No books are currently issued.</p>"}
        </section>`;
}

const pages = {
    Dashboard: renderDashboard,
    "Issue Book": renderIssuePage,
    "Return Book": renderReturnPage,
    Reports: renderReports,
    About: () => `
        <h1>About Us</h1>
        <p class="subtitle">Digital Library Management System</p>
        <section class="panel"><h2>Our System</h2>
        <p>This system helps manage books, library members, book issue and return records.</p>
        <p>It provides a central dashboard for accessing library information easily.</p></section>`
};

function showPage(page) {
    if (!pages[page]) return;

    try {
        pageContent.innerHTML = pages[page]();
    } catch (error) {
        console.error("Unable to load dashboard data.", error);
        pageContent.innerHTML =
            `<section class="panel"><p class="status-error">Unable to load saved library data. Check Local Storage and refresh the page.</p></section>`;
    }

    menuItems.forEach(item => {
        item.classList.toggle("active", item.dataset.page === page);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", function(event) {
    const menu = event.target.closest(".menu");
    const quickButton = event.target.closest("[data-go]");

    if (menu && menu.dataset.page) {
        if (menu.dataset.page === "Logout") {
            event.preventDefault();
            sessionStorage.removeItem("libraryLoggedInUser");
            window.location.href = "index.html";
        } else if (pages[menu.dataset.page]) {
            event.preventDefault();
            showPage(menu.dataset.page);
        }
    }

    if (quickButton) {
        showPage(quickButton.dataset.go);
    }
});

document.addEventListener("submit", function(event) {
    if (event.target.id === "issueForm") {
        event.preventDefault();
        const formData = new FormData(event.target);
        const memberId = formData.get("memberId");
        const bookId = formData.get("bookId");
        const issueDate = formData.get("date");
        const data = getLibraryData();
        const member = data.members.find(item => item.memberId === memberId);
        const book = data.books.find(item => item.bookId === bookId);
        const message = document.getElementById("issueMessage");

        if (!member || !book || Number(book.quantity) < 1) {
            message.textContent =
                "The selected member or available book could not be found.";
            message.className = "status-error";
            return;
        }

        const previousQuantity = book.quantity;
        book.quantity = Number(book.quantity) - 1;
        data.loans.push({
            loanId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            bookId: book.bookId,
            bookName: book.bookName,
            memberId: member.memberId,
            memberName: member.name,
            issueDate
        });

        try {
            saveDashboardData([
                [BOOKS_KEY, data.books],
                [LOANS_KEY, data.loans]
            ]);
            showPage("Issue Book");
        } catch (error) {
            console.error("Unable to save the issue record.", error);
            book.quantity = previousQuantity;
            message.textContent = "Unable to save the issue record in Local Storage.";
            message.className = "status-error";
        }
    }

    if (event.target.id === "returnForm") {
        event.preventDefault();
        const loanId = new FormData(event.target).get("loanId");
        const data = getLibraryData();
        const loanIndex = data.loans.findIndex(item => item.loanId === loanId);
        const message = document.getElementById("returnMessage");

        if (loanIndex < 0) {
            message.textContent = "The selected issue record could not be found.";
            message.className = "status-error";
            return;
        }

        const loan = data.loans[loanIndex];
        const book = data.books.find(item => item.bookId === loan.bookId);
        if (!book) {
            message.textContent = "The issued book is missing from the book list.";
            message.className = "status-error";
            return;
        }

        data.loans.splice(loanIndex, 1);
        book.quantity = Number(book.quantity) + 1;
        data.returns.push({
            bookId: loan.bookId,
            bookName: loan.bookName,
            memberId: loan.memberId,
            memberName: loan.memberName,
            returnedAt: new Date().toISOString()
        });

        try {
            saveDashboardData([
                [BOOKS_KEY, data.books],
                [LOANS_KEY, data.loans],
                [RETURNS_KEY, data.returns]
            ]);
            showPage("Return Book");
        } catch (error) {
            console.error("Unable to save the return record.", error);
            message.textContent = "Unable to save the return record in Local Storage.";
            message.className = "status-error";
        }
    }
});

showPage("Dashboard");
