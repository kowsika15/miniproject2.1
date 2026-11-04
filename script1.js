
const defaultMembers = [
    {
        id: "M001",
        name: "Arun Kumar",
        email: "arun@example.com",
        department: "Computer Science",
        status: "Active"
    },
    {
        id: "M002",
        name: "Priya Devi",
        email: "priya@example.com",
        department: "Commerce",
        status: "Active"
    },
    {
        id: "M003",
        name: "Karthik Raj",
        email: "karthik@example.com",
        department: "Mathematics",
        status: "Inactive"
    },
    {
        id: "M004",
        name: "Divya Sri",
        email: "divya@example.com",
        department: "English",
        status: "Active"
    },
    {
        id: "M005",
        name: "Vijay Anand",
        email: "vijay@example.com",
        department: "Physics",
        status: "Active"
    }
];

let members;

try {
    const saved = localStorage.getItem("libraryMembers");
    members = saved ? JSON.parse(saved) : defaultMembers;
    if (!Array.isArray(members)) members = defaultMembers;
} catch {
    members = defaultMembers;
}

let editingId = null;

function saveMembers() {
    localStorage.setItem("libraryMembers", JSON.stringify(members));
}

function updateStats() {
    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("activeMembers").textContent =
        members.filter(m => m.status === "Active").length;

    document.getElementById("totalDepartments").textContent =
        new Set(members.map(m => m.department)).size;
}

function renderMembers() {
    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const department = document.getElementById("departmentFilter").value;

    const filtered = members.filter(member => {
        const matchesSearch =
            member.id.toLowerCase().includes(search) ||
            member.name.toLowerCase().includes(search) ||
            member.department.toLowerCase().includes(search);

        const matchesDepartment =
            !department || member.department === department;

        return matchesSearch && matchesDepartment;
    });

    const table = document.getElementById("memberTable");

    table.replaceChildren();

    if (filtered.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No members found.";
        cell.style.textAlign = "center";
        cell.style.padding = "30px";

        row.appendChild(cell);
        table.appendChild(row);
    }

    filtered.forEach(member => {
        const row = document.createElement("tr");

        const values = [
            member.id,
            member.name,
            member.email,
            member.department
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;

            if (index === 0) cell.className = "member-id";
            if (index === 1) cell.className = "member-name";

            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = "status " +
            (member.status === "Active" ? "active" : "inactive");
        badge.textContent = member.status;

        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editMember(member.id));

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteMember(member.id));

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });

    document.getElementById("resultCount").textContent =
        `Showing ${filtered.length} of ${members.length} members`;

    updateStats();
}

function openAddForm() {
    editingId = null;

    document.getElementById("memberForm").reset();
    document.getElementById("memberId").disabled = false;
    document.getElementById("formTitle").textContent = "Add New Member";
    document.getElementById("saveButton").textContent = "Save Member";

    const panel = document.getElementById("memberFormPanel");
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeForm() {
    document.getElementById("memberFormPanel").hidden = true;
    editingId = null;
}

function editMember(id) {
    const member = members.find(m => m.id === id);

    if (!member) return;

    editingId = id;

    document.getElementById("memberId").value = member.id;
    document.getElementById("memberId").disabled = true;
    document.getElementById("memberName").value = member.name;
    document.getElementById("memberEmail").value = member.email;
    document.getElementById("memberDepartment").value = member.department;
    document.getElementById("memberStatus").value = member.status;

    document.getElementById("formTitle").textContent = "Edit Member";
    document.getElementById("saveButton").textContent = "Update Member";

    const panel = document.getElementById("memberFormPanel");
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteMember(id) {
    const member = members.find(m => m.id === id);

    if (!member) return;

    const confirmed = confirm(
        `Are you sure you want to delete ${member.name}?`
    );

    if (!confirmed) return;

    members = members.filter(m => m.id !== id);
    saveMembers();
    renderMembers();
}

document.getElementById("memberForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("memberId").value.trim();
    const name = document.getElementById("memberName").value.trim();
    const email = document.getElementById("memberEmail").value.trim();
    const department = document.getElementById("memberDepartment").value;
    const status = document.getElementById("memberStatus").value;

    if (!id || !name || !email || !department) {
        alert("Please fill in all required fields.");
        return;
    }

    if (editingId === null && members.some(m => m.id === id)) {
        alert("This Member ID already exists. Please use another ID.");
        return;
    }

    const memberData = { id, name, email, department, status };

    if (editingId !== null) {
        members = members.map(m =>
            m.id === editingId ? memberData : m
        );
    } else {
        members.push(memberData);
    }

    saveMembers();
    renderMembers();
    closeForm();

    alert(editingId === null
        ? "Member added successfully!"
        : "Member updated successfully!");
});

renderMembers();
