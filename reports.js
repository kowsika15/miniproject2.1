
const BOOK_KEY = "libraryBooks_v2";
const MEMBER_KEY = "libraryMembers";
const ISSUE_KEY = "libraryIssues";

function generateReports() {
    const books = JSON.parse(localStorage.getItem(BOOK_KEY)) || [];
    const members = JSON.parse(localStorage.getItem(MEMBER_KEY)) || [];
    const issues = JSON.parse(localStorage.getItem(ISSUE_KEY)) || [];

    // Available quantity in the library
    const available = books.reduce(
        (total, book) => total + Number(book.quantity || 0), 0
    );

    // Books currently issued and not yet returned
    const issued = issues
        .filter(issue => issue.status !== "Returned")
        .reduce(
            (total, issue) => total + Number(issue.quantity || 0), 0
        );

    // Total physical book copies = available + currently issued
    const total = available + issued;

    document.getElementById("totalBooks").textContent = total;
    document.getElementById("totalMembers").textContent = members.length;
    document.getElementById("availableBooks").textContent = available;
    document.getElementById("issuedBooks").textContent = issued;

    displayReportTable(issues);
}

function displayReportTable(issues) {
    const reportTable = document.getElementById("reportTable");
    reportTable.innerHTML = "";

    if (issues.length === 0) {
        reportTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center">
                    No Records Found
                </td>
            </tr>`;
        return;
    }

    issues.forEach((issue, index) => {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            issue.memberName,
            issue.bookName,
            issue.quantity,
            issue.issueDate,
            issue.returnDate,
            issue.status || "Issued"
        ];

        values.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value ?? "";
            row.appendChild(td);
        });

        reportTable.appendChild(row);
    });
}

// Generate reports when page opens
generateReports();
