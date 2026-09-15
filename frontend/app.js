const API_URL = "http://127.0.0.1:8000";

let allApplications = [];

const modal = document.getElementById("applicationModal");
const addButton = document.getElementById("addButton");
const closeModalButton = document.getElementById("closeModal");
const form = document.getElementById("applicationForm");

const applicationsList =
    document.getElementById("applicationsList");

const searchInput =
    document.getElementById("searchInput");

const filterStatus =
    document.getElementById("filterStatus");


addButton.addEventListener("click", openAddModal);

closeModalButton.addEventListener("click", closeModal);

searchInput.addEventListener("input", applyFilters);

filterStatus.addEventListener("change", applyFilters);


window.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});


function openAddModal() {
    form.reset();

    document.getElementById("applicationId").value = "";
    document.getElementById("modalTitle").textContent =
        "Add Application";

    modal.style.display = "block";
}


function closeModal() {
    modal.style.display = "none";
}


async function loadApplications() {

    try {
        const response = await fetch(
            `${API_URL}/applications`
        );

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        allApplications = await response.json();

        applyFilters();
        updateStats();

    } catch (error) {

        applicationsList.innerHTML =
            '<p class="empty-message">Unable to load applications.</p>';

        console.error(error);
    }
}


function applyFilters() {

    const search =
        searchInput.value.toLowerCase().trim();

    const selectedStatus =
        filterStatus.value;

    const filteredApplications =
        allApplications.filter(application => {

            const matchesSearch =
                application.company
                    .toLowerCase()
                    .includes(search)
                ||
                application.position
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                selectedStatus === "All"
                ||
                application.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

    displayApplications(filteredApplications);
}


function displayApplications(applications) {

    applicationsList.innerHTML = "";

    if (applications.length === 0) {

        applicationsList.innerHTML =
            '<p class="empty-message">No applications found.</p>';

        return;
    }


    applications.forEach(application => {

        const card = document.createElement("div");
        card.className = "application-card";

        const date = application.created_at
            ? new Date(application.created_at)
                .toLocaleDateString()
            : "Unknown date";

        const jobLink = application.job_url
            ? `
                <a
                    class="job-link"
                    href="${application.job_url}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View job posting
                </a>
              `
            : "";


        card.innerHTML = `
            <div>
                <div class="company">
                    ${escapeHtml(application.company)}
                </div>

                <div class="position">
                    ${escapeHtml(application.position)}
                </div>

                ${jobLink}
            </div>

            <div class="application-meta">

                <div>
                    ${escapeHtml(
                        application.location || "No location"
                    )}
                </div>

                <div class="application-date">
                    Added ${date}
                </div>

            </div>

            <select
                class="status-select"
                data-id="${application.id}"
            >
                ${createStatusOptions(application.status)}
            </select>

            <div class="actions">

                <button
                    class="action-button edit-button"
                    data-edit-id="${application.id}"
                >
                    Edit
                </button>

                <button
                    class="action-button delete-button"
                    data-delete-id="${application.id}"
                >
                    Delete
                </button>

            </div>
        `;


        applicationsList.appendChild(card);
    });


    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener(
                "change",
                event => {
                    updateStatus(
                        Number(event.target.dataset.id),
                        event.target.value
                    );
                }
            );
        });


    document
        .querySelectorAll("[data-edit-id]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    openEditModal(
                        Number(button.dataset.editId)
                    );
                }
            );
        });


    document
        .querySelectorAll("[data-delete-id]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    deleteApplication(
                        Number(button.dataset.deleteId)
                    );
                }
            );
        });
}


function createStatusOptions(currentStatus) {

    const statuses = [
        "Applied",
        "Interview",
        "Offer",
        "Rejected"
    ];

    return statuses
        .map(status => `
            <option
                value="${status}"
                ${status === currentStatus
                    ? "selected"
                    : ""}
            >
                ${status}
            </option>
        `)
        .join("");
}


function updateStats() {

    document.getElementById("totalCount").textContent =
        allApplications.length;

    document.getElementById("appliedCount").textContent =
        allApplications.filter(
            app => app.status === "Applied"
        ).length;

    document.getElementById("interviewCount").textContent =
        allApplications.filter(
            app => app.status === "Interview"
        ).length;

    document.getElementById("offerCount").textContent =
        allApplications.filter(
            app => app.status === "Offer"
        ).length;
}


form.addEventListener("submit", async event => {

    event.preventDefault();

    const id =
        document.getElementById("applicationId").value;

    const application = {

        company:
            document.getElementById("company").value.trim(),

        position:
            document.getElementById("position").value.trim(),

        status:
            document.getElementById("status").value,

        location:
            document.getElementById("location").value.trim()
            || null,

        job_url:
            document.getElementById("jobUrl").value.trim()
            || null,

        notes:
            document.getElementById("notes").value.trim()
            || null
    };


    const url = id
        ? `${API_URL}/applications/${id}`
        : `${API_URL}/applications`;

    const method = id
        ? "PUT"
        : "POST";


    const response = await fetch(url, {

        method: method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(application)
    });


    if (!response.ok) {
        alert("Unable to save application.");
        return;
    }


    closeModal();
    form.reset();

    await loadApplications();
});


function openEditModal(id) {

    const application =
        allApplications.find(
            application => application.id === id
        );

    if (!application) {
        return;
    }


    document.getElementById("applicationId").value =
        application.id;

    document.getElementById("company").value =
        application.company;

    document.getElementById("position").value =
        application.position;

    document.getElementById("status").value =
        application.status;

    document.getElementById("location").value =
        application.location || "";

    document.getElementById("jobUrl").value =
        application.job_url || "";

    document.getElementById("notes").value =
        application.notes || "";

    document.getElementById("modalTitle").textContent =
        "Edit Application";

    modal.style.display = "block";
}


async function updateStatus(id, status) {

    const response = await fetch(
        `${API_URL}/applications/${id}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PATCH"
        }
    );

    if (!response.ok) {
        alert("Unable to update status.");
        return;
    }

    await loadApplications();
}


async function deleteApplication(id) {

    const confirmed =
        confirm("Are you sure you want to delete this application?");

    if (!confirmed) {
        return;
    }


    const response = await fetch(
        `${API_URL}/applications/${id}`,
        {
            method: "DELETE"
        }
    );


    if (!response.ok) {
        alert("Unable to delete application.");
        return;
    }


    await loadApplications();
}


function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent = value;

    return element.innerHTML;
}


loadApplications();