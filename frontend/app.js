const API_URL = "http://127.0.0.1:8000";

let allApplications = [];
let authMode = "login";


// =========================================================
// ELEMENTS
// =========================================================

const authPage =
    document.getElementById("authPage");

const appPage =
    document.getElementById("appPage");

const authForm =
    document.getElementById("authForm");

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const authSubmit =
    document.getElementById("authSubmit");

const authMessage =
    document.getElementById("authMessage");


const modal =
    document.getElementById("applicationModal");

const addButton =
    document.getElementById("addButton");

const logoutButton =
    document.getElementById("logoutButton");

const closeModalButton =
    document.getElementById("closeModal");

const form =
    document.getElementById("applicationForm");

const applicationsList =
    document.getElementById("applicationsList");

const searchInput =
    document.getElementById("searchInput");

const filterStatus =
    document.getElementById("filterStatus");


// =========================================================
// AUTH HELPERS
// =========================================================

function getToken() {
    return localStorage.getItem("access_token");
}


function authHeaders() {
    return {
        "Authorization": `Bearer ${getToken()}`
    };
}


function showAuthPage() {
    authPage.style.display = "flex";
    appPage.style.display = "none";
}


function showAppPage() {
    authPage.style.display = "none";
    appPage.style.display = "block";

    loadApplications();
}


// =========================================================
// LOGIN / REGISTER TABS
// =========================================================

loginTab.addEventListener("click", () => {

    authMode = "login";

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    authSubmit.textContent = "Login";
    authMessage.textContent = "";
});


registerTab.addEventListener("click", () => {

    authMode = "register";

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    authSubmit.textContent = "Create Account";
    authMessage.textContent = "";
});


// =========================================================
// LOGIN / REGISTER FORM
// =========================================================

authForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            document
                .getElementById("authEmail")
                .value
                .trim();

        const password =
            document
                .getElementById("authPassword")
                .value;


        try {

            const response = await fetch(
                `${API_URL}/${authMode}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                authMessage.textContent =
                    data.detail ||
                    "Something went wrong.";

                return;
            }


            // Registration completed successfully
            if (authMode === "register") {

                authMessage.textContent =
                    "Account created. You can now log in.";

                authMode = "login";

                loginTab.classList.add("active");
                registerTab.classList.remove("active");

                authSubmit.textContent = "Login";

                document
                    .getElementById("authPassword")
                    .value = "";

                return;
            }


            // Login completed successfully
            localStorage.setItem(
                "access_token",
                data.access_token
            );

            authForm.reset();

            showAppPage();

        } catch (error) {

            console.error(error);

            authMessage.textContent =
                "Unable to connect to the server.";
        }
    }
);


// =========================================================
// LOGOUT
// =========================================================

logoutButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "access_token"
        );

        allApplications = [];

        authForm.reset();
        authMessage.textContent = "";

        showAuthPage();
    }
);


// =========================================================
// APPLICATION EVENT LISTENERS
// =========================================================

addButton.addEventListener(
    "click",
    openAddModal
);


closeModalButton.addEventListener(
    "click",
    closeModal
);


searchInput.addEventListener(
    "input",
    applyFilters
);


filterStatus.addEventListener(
    "change",
    applyFilters
);


window.addEventListener(
    "click",
    event => {

        if (event.target === modal) {
            closeModal();
        }
    }
);


// =========================================================
// MODAL
// =========================================================

function openAddModal() {

    form.reset();

    document
        .getElementById("applicationId")
        .value = "";

    document
        .getElementById("modalTitle")
        .textContent = "Add Application";

    modal.style.display = "block";
}


function closeModal() {
    modal.style.display = "none";
}


// =========================================================
// LOAD APPLICATIONS
// =========================================================

async function loadApplications() {

    try {

        const response = await fetch(
            `${API_URL}/applications`,
            {
                headers: authHeaders()
            }
        );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            showAuthPage();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load applications"
            );
        }


        allApplications =
            await response.json();

        applyFilters();
        updateStats();

    } catch (error) {

        applicationsList.innerHTML =
            '<p class="empty-message">' +
            'Unable to load applications.' +
            '</p>';

        console.error(error);
    }
}


// =========================================================
// SEARCH + FILTER
// =========================================================

function applyFilters() {

    const search =
        searchInput
            .value
            .toLowerCase()
            .trim();

    const selectedStatus =
        filterStatus.value;


    const filteredApplications =
        allApplications.filter(
            application => {

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


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    displayApplications(
        filteredApplications
    );
}


// =========================================================
// DISPLAY APPLICATIONS
// =========================================================

function displayApplications(applications) {

    applicationsList.innerHTML = "";


    if (applications.length === 0) {

        applicationsList.innerHTML =
            '<p class="empty-message">' +
            'No applications found.' +
            '</p>';

        return;
    }


    applications.forEach(
        application => {

            const card =
                document.createElement("div");

            card.className =
                "application-card";


            const date =
                application.created_at
                    ? new Date(
                        application.created_at
                    ).toLocaleDateString()
                    : "Unknown date";


            const safeJobUrl =
                getSafeUrl(application.job_url);


            const jobLink =
                safeJobUrl
                    ? `
                        <a
                            class="job-link"
                            href="${safeJobUrl}"
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
                        ${escapeHtml(
                            application.company
                        )}
                    </div>

                    <div class="position">
                        ${escapeHtml(
                            application.position
                        )}
                    </div>

                    ${jobLink}

                </div>


                <div class="application-meta">

                    <div>
                        ${escapeHtml(
                            application.location
                            || "No location"
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
                    ${createStatusOptions(
                        application.status
                    )}
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


            applicationsList
                .appendChild(card);
        }
    );


    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener(
                "change",
                event => {

                    updateStatus(
                        Number(
                            event.target.dataset.id
                        ),
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
                        Number(
                            button.dataset.editId
                        )
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
                        Number(
                            button.dataset.deleteId
                        )
                    );
                }
            );
        });
}


// =========================================================
// STATUS OPTIONS
// =========================================================

function createStatusOptions(currentStatus) {

    const statuses = [
        "Applied",
        "Interview",
        "Offer",
        "Rejected"
    ];


    return statuses
        .map(
            status => `
                <option
                    value="${status}"
                    ${
                        status === currentStatus
                            ? "selected"
                            : ""
                    }
                >
                    ${status}
                </option>
            `
        )
        .join("");
}


// =========================================================
// STATISTICS
// =========================================================

function updateStats() {

    document
        .getElementById("totalCount")
        .textContent =
        allApplications.length;


    document
        .getElementById("appliedCount")
        .textContent =
        allApplications.filter(
            app =>
                app.status === "Applied"
        ).length;


    document
        .getElementById("interviewCount")
        .textContent =
        allApplications.filter(
            app =>
                app.status === "Interview"
        ).length;


    document
        .getElementById("offerCount")
        .textContent =
        allApplications.filter(
            app =>
                app.status === "Offer"
        ).length;
}


// =========================================================
// CREATE / UPDATE APPLICATION
// =========================================================

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            document
                .getElementById(
                    "applicationId"
                )
                .value;


        const application = {

            company:
                document
                    .getElementById("company")
                    .value
                    .trim(),

            position:
                document
                    .getElementById("position")
                    .value
                    .trim(),

            status:
                document
                    .getElementById("status")
                    .value,

            location:
                document
                    .getElementById("location")
                    .value
                    .trim()
                || null,

            job_url:
                document
                    .getElementById("jobUrl")
                    .value
                    .trim()
                || null,

            notes:
                document
                    .getElementById("notes")
                    .value
                    .trim()
                || null
        };


        const url = id
            ? `${API_URL}/applications/${id}`
            : `${API_URL}/applications`;


        const method =
            id ? "PUT" : "POST";


        try {

            const response = await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...authHeaders()
                    },

                    body:
                        JSON.stringify(
                            application
                        )
                }
            );


            if (response.status === 401) {

                localStorage.removeItem(
                    "access_token"
                );

                showAuthPage();

                return;
            }


            if (!response.ok) {

                alert(
                    "Unable to save application."
                );

                return;
            }


            closeModal();
            form.reset();

            await loadApplications();

        } catch (error) {

            console.error(error);

            alert(
                "Unable to connect to the server."
            );
        }
    }
);


// =========================================================
// EDIT APPLICATION
// =========================================================

function openEditModal(id) {

    const application =
        allApplications.find(
            application =>
                application.id === id
        );


    if (!application) {
        return;
    }


    document
        .getElementById("applicationId")
        .value =
        application.id;

    document
        .getElementById("company")
        .value =
        application.company;

    document
        .getElementById("position")
        .value =
        application.position;

    document
        .getElementById("status")
        .value =
        application.status;

    document
        .getElementById("location")
        .value =
        application.location || "";

    document
        .getElementById("jobUrl")
        .value =
        application.job_url || "";

    document
        .getElementById("notes")
        .value =
        application.notes || "";

    document
        .getElementById("modalTitle")
        .textContent =
        "Edit Application";


    modal.style.display = "block";
}


// =========================================================
// UPDATE STATUS
// =========================================================

async function updateStatus(id, status) {

    try {

        const response = await fetch(
            `${API_URL}/applications/${id}/status?status=${encodeURIComponent(status)}`,
            {
                method: "PATCH",
                headers: authHeaders()
            }
        );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            showAuthPage();

            return;
        }


        if (!response.ok) {

            alert(
                "Unable to update status."
            );

            return;
        }


        await loadApplications();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// =========================================================
// DELETE APPLICATION
// =========================================================

async function deleteApplication(id) {

    const confirmed =
        confirm(
            "Are you sure you want " +
            "to delete this application?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/applications/${id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            showAuthPage();

            return;
        }


        if (!response.ok) {

            alert(
                "Unable to delete application."
            );

            return;
        }


        await loadApplications();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );
    }
}


// =========================================================
// SECURITY HELPERS
// =========================================================

function escapeHtml(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;
}


function getSafeUrl(value) {

    if (!value) {
        return null;
    }

    try {

        const url =
            new URL(value);

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {
            return null;
        }

        return url.href;

    } catch {
        return null;
    }
}


// =========================================================
// START APPLICATION
// =========================================================

if (getToken()) {
    showAppPage();
} else {
    showAuthPage();
}