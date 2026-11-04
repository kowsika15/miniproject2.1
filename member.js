
const STORAGE_KEY = "libraryMembers";

let members = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

const form = document.getElementById("memberForm");
const memberTable = document.getElementById("memberTable");
const searchInput = document.getElementById("searchMember");

const memberId = document.getElementById("memberId");
const memberName = document.getElementById("memberName");
const department = document.getElementById("department");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const message = document.getElementById("message");

// Save data
function saveMembers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

// Reusable message function
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

// Display members
function displayMembers(data = members) {

    memberTable.innerHTML = "";

    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("emptyMessage").style.display =
        data.length === 0 ? "block" : "none";

    data.forEach(member => {

        const row = document.createElement("tr");

        [
            member.id,
            member.name,
            member.department,
            member.email,
            member.mobile
        ].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            row.appendChild(td);
        });

        const action = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.addEventListener("click", () => editMember(member.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () => deleteMember(member.id));

        action.append(editBtn, deleteBtn);
        row.appendChild(action);

        memberTable.appendChild(row);
    });
}

// ADD MEMBER
form.addEventListener("submit", function(e) {

    e.preventDefault();

    const id = memberId.value.trim();
    const name = memberName.value.trim();
    const dept = department.value.trim();
    const mail = email.value.trim();
    const phone = mobile.value.trim();

    if (!id || !name || !dept || !mail || !phone) {
        showMessage("Please fill all fields!", "red");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        showMessage("Enter valid email address!", "red");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showMessage("Enter valid 10 digit mobile number!", "red");
        return;
    }

    const duplicate = members.some(m =>
        m.id.toLowerCase() === id.toLowerCase() &&
        m.id !== editingId
    );

    if (duplicate) {
        showMessage("Member ID already exists!", "red");
        return;
    }

    const memberData = {
        id,
        name,
        department: dept,
        email: mail,
        mobile: phone
    };

    if (editingId !== null) {

        const index = members.findIndex(
            m => m.id === editingId
        );

        if (index !== -1) {
            members[index] = memberData;
        }

        showMessage("Member updated successfully!", "green");

    } else {

        members.push(memberData);

        showMessage("Member added successfully!", "green");
    }

    saveMembers();
    displayMembers();
    resetForm();
});

// EDIT MEMBER
function editMember(id) {

    const member = members.find(m => m.id === id);

    if (!member) return;

    memberId.value = member.id;
    memberName.value = member.name;
    department.value = member.department;
    email.value = member.email;
    mobile.value = member.mobile;

    editingId = id;

    memberId.disabled = true;

    submitBtn.textContent = "Update Member";
    cancelBtn.hidden = false;

    document.getElementById("formTitle").textContent =
        "Edit Member Information";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// DELETE MEMBER
function deleteMember(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) return;

    members = members.filter(m => m.id !== id);

    saveMembers();
    displayMembers();

    if (editingId === id) {
        resetForm();
    }

    showMessage("Member deleted successfully!", "green");
}

// SEARCH MEMBER
searchInput.addEventListener("input", function() {

    const search = this.value.toLowerCase().trim();

    const filteredMembers = members.filter(member => {

        return (
            member.id.toLowerCase().includes(search) ||
            member.name.toLowerCase().includes(search) ||
            member.department.toLowerCase().includes(search)
        );

    });

    displayMembers(filteredMembers);
});

// RESET FORM
function resetForm() {

    form.reset();

    editingId = null;

    memberId.disabled = false;

    submitBtn.textContent = "Add Member";
    cancelBtn.hidden = true;

    document.getElementById("formTitle").textContent =
        "Add New Member";
}

// CANCEL EDIT
cancelBtn.addEventListener("click", resetForm);

// INITIAL DISPLAY
displayMembers();
