
// Book Management System

let books = JSON.parse(localStorage.getItem("libraryBooks_v2")) || [];

let editIndex = -1;

const form = document.getElementById("bookForm");
const table = document.getElementById("bookTable");
const message = document.getElementById("message");

// Save Books

function saveBooks() {
    localStorage.setItem("libraryBooks_v2", JSON.stringify(books));
}

// Display Books

function displayBooks(searchText = "") {

    table.innerHTML = "";

    const filteredBooks = books
        .map((book, index) => ({ book, index }))
        .filter(({ book }) =>
            Object.values(book).some(value =>
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );

    if (filteredBooks.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:25px">
                    No Books Found
                </td>
            </tr>`;
    }

    filteredBooks.forEach(({ book, index }) => {

        const row = document.createElement("tr");

        const values = [
            book.bookId,
            book.bookName,
            book.author,
            book.category,
            book.publisher,
            book.year,
            book.quantity
        ];

        values.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
        });

        const action = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.onclick = () => editBook(index);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = () => deleteBook(index);

        action.appendChild(editButton);
        action.appendChild(deleteButton);

        row.appendChild(action);
        table.appendChild(row);
    });

    updateStatistics();
}

// Statistics

function updateStatistics() {

    document.getElementById("totalBooks").textContent = books.length;

    document.getElementById("totalQuantity").textContent =
        books.reduce((total, book) => total + Number(book.quantity), 0);

    document.getElementById("totalCategories").textContent =
        new Set(books.map(book => book.category)).size;
}

// Add and Update Book

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const book = {

        bookId: document.getElementById("bookId").value.trim(),

        bookName: document.getElementById("bookName").value.trim(),

        author: document.getElementById("author").value.trim(),

        category: document.getElementById("category").value,

        publisher: document.getElementById("publisher").value.trim(),

        year: document.getElementById("year").value,

        quantity: Number(document.getElementById("quantity").value)

    };

    // Validation

    if (
        !book.bookId ||
        !book.bookName ||
        !book.author ||
        !book.category ||
        !book.publisher ||
        !book.year
    ) {
        showMessage("Please fill all fields!", "red");
        return;
    }

    if (
        !Number.isInteger(book.quantity) ||
        book.quantity <= 0
    ) {
        showMessage("Quantity must be greater than zero!", "red");
        return;
    }

    // Duplicate ID Check

    const duplicate = books.some((item, index) =>
        item.bookId.toLowerCase() === book.bookId.toLowerCase() &&
        index !== editIndex
    );

    if (duplicate) {
        showMessage("This Book ID already exists!", "red");
        return;
    }

    // Update Existing Book

    if (editIndex !== -1) {

        books[editIndex] = book;

        showMessage("Book Updated Successfully!", "green");

    } else {

        // Add New Book

        books.push(book);

        showMessage("Book Added Successfully!", "green");
    }

    saveBooks();

    displayBooks();

    form.reset();

    editIndex = -1;

    document.getElementById("formTitle").textContent =
        "➕ Add New Book";

    document.getElementById("submitBtn").textContent =
        "Add Book";

    document.getElementById("cancelBtn").style.display =
        "none";

});

// Edit Book

function editBook(index) {

    const book = books[index];

    document.getElementById("bookId").value = book.bookId;

    document.getElementById("bookName").value = book.bookName;

    document.getElementById("author").value = book.author;

    document.getElementById("category").value = book.category;

    document.getElementById("publisher").value = book.publisher;

    document.getElementById("year").value = book.year;

    document.getElementById("quantity").value = book.quantity;

    editIndex = index;

    document.getElementById("formTitle").textContent =
        "✏️ Edit Book";

    document.getElementById("submitBtn").textContent =
        "Update Book";

    document.getElementById("cancelBtn").style.display =
        "inline-block";

    document.querySelector(".form-section").scrollIntoView({
        behavior: "smooth"
    });
}

// Delete Book

function deleteBook(index) {

    if (confirm("Are you sure you want to delete this book?")) {

        books.splice(index, 1);

        saveBooks();

        displayBooks(
            document.getElementById("search").value
        );

        showMessage("Book Deleted Successfully!", "green");

    }
}

// Cancel Edit

function cancelEdit() {

    form.reset();

    editIndex = -1;

    document.getElementById("formTitle").textContent =
        "➕ Add New Book";

    document.getElementById("submitBtn").textContent =
        "Add Book";

    document.getElementById("cancelBtn").style.display =
        "none";

    message.textContent = "";

}

// Message

function showMessage(text, color) {

    message.textContent = text;

    message.style.color = color;

}

// Search

document.getElementById("search").addEventListener("input", function() {

    displayBooks(this.value);

});

// Initial Display

displayBooks();
