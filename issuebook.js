
const MEMBER_KEY = "libraryMembers";
const BOOK_KEY = "libraryBooks_v2";
const ISSUE_KEY = "libraryIssues";

let members = [];
let books = [];
let issuedBooks = JSON.parse(localStorage.getItem(ISSUE_KEY)) || [];

const memberSelect = document.getElementById("memberName");
const bookSelect = document.getElementById("bookName");

const memberIdInput = document.getElementById("memberId");
const bookIdInput = document.getElementById("bookId");
const availableInput = document.getElementById("availableQuantity");

const issueForm = document.getElementById("issueForm");
const issueTable = document.getElementById("issueTable");
const message = document.getElementById("message");

// Load latest data from LocalStorage
function loadData() {
    members = JSON.parse(localStorage.getItem(MEMBER_KEY)) || [];
    books = JSON.parse(localStorage.getItem(BOOK_KEY)) || [];

    loadMembers();
    loadBooks();
    displayIssuedBooks();
}

// Load Members dropdown
function loadMembers() {
    memberSelect.innerHTML = '<option value="">Select Member</option>';

    members.forEach(member => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = member.name;
        memberSelect.appendChild(option);
    });
}

// Load Books dropdown
function loadBooks() {
    bookSelect.innerHTML = '<option value="">Select Book</option>';

    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book.bookId;
        option.textContent = book.bookName;
        bookSelect.appendChild(option);
    });
}

// Select Member
memberSelect.addEventListener("change", function() {
    const member = members.find(m => m.id === this.value);

    memberIdInput.value = member ? member.id : "";
});

// Select Book
bookSelect.addEventListener("change", function() {
    const book = books.find(b => b.bookId === this.value);

    bookIdInput.value = book ? book.bookId : "";
    availableInput.value = book ? book.quantity : "";
});

// Show message
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

// Issue Book
issueForm.addEventListener("submit", function(e) {
    e.preventDefault();

    // Get latest book and member data
    members = JSON.parse(localStorage.getItem(MEMBER_KEY)) || [];
    books = JSON.parse(localStorage.getItem(BOOK_KEY)) || [];

    const selectedMember = members.find(
        m => m.id === memberSelect.value
    );

    const selectedBook = books.find(
        b => b.bookId === bookSelect.value
    );

    const quantity = Number(
        document.getElementById("issueQuantity").value
    );

    const issueDate = document.getElementById("issueDate").value;
    const returnDate = document.getElementById("returnDate").value;

    if (!selectedMember || !selectedBook) {
        showMessage("Please select a member and a book!", "red");
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showMessage("Enter a valid issue quantity!", "red");
        return;
    }

    if (quantity > Number(selectedBook.quantity)) {
        showMessage("Not enough books available!", "red");
        return;
    }

    if (!issueDate || !returnDate || returnDate < issueDate) {
        showMessage("Please select valid issue and return dates!", "red");
        return;
    }

    // Reduce available book quantity
    selectedBook.quantity = Number(selectedBook.quantity) - quantity;

    // Save updated quantity using Book Management key
    localStorage.setItem(BOOK_KEY, JSON.stringify(books));

    // Create issue record
    const issue = {
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        bookId: selectedBook.bookId,
        bookName: selectedBook.bookName,
        quantity: quantity,
        issueDate: issueDate,
        returnDate: returnDate,
        status: "Issued"
    };

    issuedBooks.push(issue);

    localStorage.setItem(ISSUE_KEY, JSON.stringify(issuedBooks));

    showMessage("Book issued successfully!", "green");

    issueForm.reset();

    loadData();
});

// Display issued books
function displayIssuedBooks() {
    issueTable.innerHTML = "";

    if (issuedBooks.length === 0) {
        issueTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center">
                    No Books Issued
                </td>
            </tr>`;
        return;
    }

    issuedBooks.forEach((issue, index) => {
        const row = document.createElement("tr");

        [
            index + 1,
            issue.memberName,
            issue.bookName,
            issue.quantity,
            issue.issueDate,
            issue.returnDate,
            issue.status
        ].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
        });

        issueTable.appendChild(row);
    });
}

// Initial load
loadData();
