const SUPABASE_URL = "https://qyipadinsphoyxotrceo.supabase.co";
const SUPABASE_KEY = "sb_publishable_S73dZK9ro03lWDbHFzZhw_5t5pDtGt";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ELEMENTS
// ============================================================

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const articleForm = document.getElementById("articleForm");
const articleId = document.getElementById("articleId");

const title = document.getElementById("title");
const category = document.getElementById("category");
const author = document.getElementById("author");
const excerpt = document.getElementById("excerpt");
const content = document.getElementById("content");
const publishedAt = document.getElementById("publishedAt");

const imageFile = document.getElementById("imageFile");
const featured = document.getElementById("featured");
const publishNow = document.getElementById("publishNow");

const articleMessage = document.getElementById("articleMessage");
const articleList = document.getElementById("articleList");

const editorHeading = document.getElementById("editorHeading");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const currentImageWrap = document.getElementById("currentImageWrap");
const currentImage = document.getElementById("currentImage");

let editingArticle = null;


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 90);
}


function message(element, text, type = "") {
    if (!element) return;

    element.textContent = text;
    element.className = `message ${type}`;
}


function formatDate(value) {
    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "No date";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


// ============================================================
// SESSION
// ============================================================

async function getCurrentSession() {
    const { data, error } = await db.auth.getSession();

    if (error) {
        throw new Error(
            `Could not check your login session: ${error.message}`
        );
    }

    return data?.session || null;
}


async function requireSession() {
    const session = await getCurrentSession();

    if (!session) {
        throw new Error(
            "Your admin session has expired. Please sign in again."
        );
    }

    return session;
}


// ============================================================
// FORM RESET
// ============================================================

function resetForm() {
    articleForm.reset();

    articleId.value = "";

    author.value = "PPW Staff";

    publishNow.checked = true;
    featured.checked = false;

    editingArticle = null;

    editorHeading.textContent = "Create Article";

    cancelEditBtn.classList.add("hidden");

    currentImageWrap.classList.add("hidden");
    currentImage.removeAttribute("src");

    message(articleMessage, "");
}


// ============================================================
// LOGIN / LOGOUT
// ============================================================

async function checkSession() {
    try {
        const session = await getCurrentSession();

        if (session) {
            loginView.classList.add("hidden");
            adminView.classList.remove("hidden");

            await loadArticles();
        } else {
            adminView.classList.add("hidden");
            loginView.classList.remove("hidden");
        }

    } catch (error) {
        console.error("Session check failed:", error);

        adminView.classList.add("hidden");
        loginView.classList.remove("hidden");

        message(
            loginMessage,
            error.message || "Could not check your session.",
            "error"
        );
    }
}


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message(loginMessage, "Signing in...");

    const email = document
        .getElementById("loginEmail")
        .value
        .trim();

    const password = document
        .getElementById("loginPassword")
        .value;

    if (!email || !password) {
        message(
            loginMessage,
            "Please enter your email and password.",
            "error"
        );

        return;
    }

    try {
        const { error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            message(
                loginMessage,
                error.message,
                "error"
            );

            return;
        }

        loginForm.reset();
        message(loginMessage, "");

        await checkSession();

    } catch (error) {
        console.error("Login error:", error);

        message(
            loginMessage,
            error.message || "Something went wrong while signing in.",
            "error"
        );
    }
});


document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {

        try {
            await db.auth.signOut();

            resetForm();

            await checkSession();

        } catch (error) {
            console.error("Logout error:", error);

            message(
                loginMessage,
                error.message || "Could not sign out.",
                "error"
            );
        }
    });


document
    .getElementById("refreshBtn")
    .addEventListener("click", async () => {
        await loadArticles();
    });


cancelEditBtn.addEventListener("click", () => {
    resetForm();
});


// ============================================================
// IMAGE UPLOAD
// ============================================================

async function uploadImage(file) {
    if (!file) {
        return null;
    }

    // Make sure the admin is still logged in.
    await requireSession();

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "Please upload a JPG, PNG, WEBP, or GIF image."
        );
    }

    // 10 MB maximum.
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error(
            "The image is too large. Please use an image smaller than 10 MB."
        );
    }

    const originalName = file.name || "image.jpg";

    const extension =
        originalName.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension =
        ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
            ? extension
            : "jpg";

    const filePath =
        `articles/${crypto.randomUUID()}.${safeExtension}`;


    try {
        const { error } = await db.storage
            .from("article-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

        if (error) {
            console.error("Storage upload error:", error);

            if (
                error.message?.toLowerCase().includes("row-level security") ||
                error.statusCode === "403"
            ) {
                throw new Error(
                    "Supabase blocked the image upload with Row Level Security. " +
                    "Make sure your authenticated INSERT policy exists for the " +
                    "'article-images' storage bucket."
                );
            }

            if (
                error.message?.toLowerCase().includes("bucket not found")
            ) {
                throw new Error(
                    "The 'article-images' storage bucket could not be found. " +
                    "Check that the bucket exists in Supabase Storage."
                );
            }

            throw new Error(
                `Image upload failed: ${error.message}`
            );
        }

        const publicUrlResult = db.storage
            .from("article-images")
            .getPublicUrl(filePath);

        const publicUrl =
            publicUrlResult?.data?.publicUrl;

        if (!publicUrl) {
            throw new Error(
                "The image uploaded, but Supabase did not return a public image URL."
            );
        }

        return publicUrl;

    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
}


// ============================================================
// ARTICLE DATA
// ============================================================

function buildArticleData(status, imageUrl) {
    const headline = title.value.trim();
    const body = content.value.trim();

    if (!headline) {
        throw new Error("Please enter a headline.");
    }

    if (!body) {
        throw new Error("Please enter the article text.");
    }

    let slug;

    // Keep the original slug when editing without changing
    // the headline.
    if (
        editingArticle &&
        editingArticle.title === headline &&
        editingArticle.slug
    ) {
        slug = editingArticle.slug;
    } else {
        slug = slugify(headline);
    }

    if (!slug) {
        throw new Error(
            "The headline could not be turned into a valid article URL."
        );
    }


    let dateValue = null;

    if (status === "published") {
        if (publishedAt.value) {
            const parsedDate = new Date(publishedAt.value);

            if (Number.isNaN(parsedDate.getTime())) {
                throw new Error(
                    "The publication date is invalid."
                );
            }

            dateValue = parsedDate.toISOString();

        } else {
            dateValue = new Date().toISOString();
        }
    }


    return {
        title: headline,

        slug,

        excerpt: excerpt.value.trim(),

        content: body,

        category: category.value,

        author:
            author.value.trim() || "PPW Staff",

        image_url: imageUrl || null,

        published_at: dateValue,

        status,

        featured: Boolean(featured.checked),

        updated_at: new Date().toISOString()
    };
}


// ============================================================
// SAVE ARTICLE
// ============================================================

async function saveArticle(status) {
    // Make absolutely sure we're authenticated.
    await requireSession();


    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    let imageUrl =
        editingArticle?.image_url || null;


    // IMPORTANT:
    // Only upload a new image if the user actually selected one.
    //
    // If we're editing an article and they don't choose a new
    // image, the old image URL stays untouched.
    if (imageFile.files && imageFile.files.length > 0) {

        message(
            articleMessage,
            "Uploading image..."
        );

        imageUrl = await uploadImage(
            imageFile.files[0]
        );
    }


    // --------------------------------------------------------
    // BUILD ARTICLE
    // --------------------------------------------------------

    const data = buildArticleData(
        status,
        imageUrl
    );


    // --------------------------------------------------------
    // UPDATE EXISTING ARTICLE
    // --------------------------------------------------------

    if (editingArticle) {

        message(
            articleMessage,
            "Saving changes..."
        );

        const { data: updatedArticle, error } =
            await db
                .from("articles")
                .update(data)
                .eq("id", editingArticle.id)
                .select()
                .single();


        if (error) {
            console.error(
                "Article update error:",
                error
            );

            if (
                error.code === "42501" ||
                error.message
                    ?.toLowerCase()
                    .includes("row-level security")
            ) {
                throw new Error(
                    "Supabase blocked the article update with Row Level Security. " +
                    "Make sure your authenticated UPDATE policy exists on the " +
                    "'articles' table."
                );
            }

            if (error.code === "PGRST116") {
                throw new Error(
                    "The article could not be found. It may have already been deleted."
                );
            }

            if (error.code === "23505") {
                throw new Error(
                    "An article with this slug already exists. " +
                    "Try changing the headline slightly."
                );
            }

            throw new Error(
                `Could not update the article: ${error.message}`
            );
        }


        if (!updatedArticle) {
            throw new Error(
                "The article was not returned after saving. " +
                "Check your Supabase SELECT policy."
            );
        }


        resetForm();

        await loadArticles();

        return "updated";
    }


    // --------------------------------------------------------
    // CREATE NEW ARTICLE
    // --------------------------------------------------------

    message(
        articleMessage,
        "Publishing..."
    );


    const { data: newArticle, error } =
        await db
            .from("articles")
            .insert(data)
            .select()
            .single();


    if (error) {
        console.error(
            "Article insert error:",
            error
        );

        if (
            error.code === "42501" ||
            error.message
                ?.toLowerCase()
                .includes("row-level security")
        ) {
            throw new Error(
                "Supabase blocked the new article with Row Level Security. " +
                "Make sure your authenticated INSERT policy exists on the " +
                "'articles' table."
            );
        }

        if (error.code === "23505") {
            throw new Error(
                "An article with this headline or URL already exists. " +
                "Try changing the headline slightly."
            );
        }

        throw new Error(
            `Could not create the article: ${error.message}`
        );
    }


    if (!newArticle) {
        throw new Error(
            "The article was created, but Supabase did not return it. " +
            "Check your SELECT policy."
        );
    }


    resetForm();

    await loadArticles();

    return "created";
}


// ============================================================
// PUBLISH ARTICLE
// ============================================================

articleForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        try {

            message(
                articleMessage,
                editingArticle
                    ? "Updating article..."
                    : "Publishing article..."
            );


            await saveArticle("published");


            message(
                articleMessage,
                editingArticle
                    ? "Article updated successfully."
                    : "Article published successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Save article error:",
                error
            );

            message(
                articleMessage,
                error.message ||
                    "Something went wrong while saving the article.",
                "error"
            );
        }
    }
);


// ============================================================
// SAVE DRAFT
// ============================================================

document
    .getElementById("saveDraftBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                message(
                    articleMessage,
                    "Saving draft..."
                );


                await saveArticle("draft");


                message(
                    articleMessage,
                    editingArticle
                        ? "Draft updated successfully."
                        : "Draft saved successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Save draft error:",
                    error
                );

                message(
                    articleMessage,
                    error.message ||
                        "Something went wrong while saving the draft.",
                    "error"
                );
            }
        }
    );


// ============================================================
// LOAD ARTICLES
// ============================================================

async function loadArticles() {

    articleList.innerHTML =
        '<div class="empty-state">Loading articles...</div>';


    try {

        await requireSession();


        const {
            data,
            error
        } = await db
            .from("articles")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Load articles error:",
                error
            );


            if (
                error.code === "42501" ||
                error.message
                    ?.toLowerCase()
                    .includes("row-level security")
            ) {

                articleList.innerHTML =
                    '<div class="empty-state">' +
                    'Supabase blocked access to your articles. ' +
                    'Make sure authenticated users have a SELECT policy on the articles table.' +
                    '</div>';

                return;
            }


            articleList.innerHTML =
                `<div class="empty-state">
                    Could not load articles:
                    ${escapeHtml(error.message)}
                </div>`;

            return;
        }


        if (!data || !data.length) {

            articleList.innerHTML =
                '<div class="empty-state">' +
                'No articles yet. Create your first story.' +
                '</div>';

            return;
        }


        articleList.innerHTML = data
            .map((article) => {

                const image =
                    article.image_url
                        ? `
                            <img
                                class="article-thumb"
                                src="${escapeHtml(article.image_url)}"
                                alt=""
                            >
                        `
                        : `
                            <div class="article-thumb"></div>
                        `;


                return `
                    <article class="article-item">

                        ${image}

                        <div>

                            <div class="article-item-top">

                                <div>

                                    <h3>
                                        ${escapeHtml(article.title)}
                                    </h3>

                                    <p>
                                        ${escapeHtml(article.category)}
                                        ·
                                        ${escapeHtml(article.author)}
                                        ·
                                        ${formatDate(
                                            article.published_at ||
                                            article.created_at
                                        )}
                                    </p>

                                </div>


                                <span
                                    class="badge ${escapeHtml(article.status)}"
                                >
                                    ${escapeHtml(
                                        article.status
                                    ).toUpperCase()}
                                </span>

                            </div>


                            <div class="article-actions">

                                <button
                                    class="small-btn"
                                    data-action="edit"
                                    data-id="${article.id}"
                                    type="button"
                                >
                                    Edit
                                </button>


                                <button
                                    class="small-btn"
                                    data-action="delete"
                                    data-id="${article.id}"
                                    type="button"
                                >
                                    Delete
                                </button>


                                ${
                                    article.status === "published"
                                        ? `
                                            <a
                                                class="small-btn"
                                                href="article.html?slug=${encodeURIComponent(
                                                    article.slug
                                                )}"
                                                target="_blank"
                                                rel="noopener"
                                            >
                                                View
                                            </a>
                                        `
                                        : ""
                                }

                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");


    } catch (error) {

        console.error(
            "Load articles exception:",
            error
        );


        articleList.innerHTML =
            `<div class="empty-state">
                ${escapeHtml(
                    error.message ||
                    "Could not load articles."
                )}
            </div>`;
    }
}


// ============================================================
// EDIT / DELETE BUTTONS
// ============================================================

articleList.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest("[data-action]");


        if (!button) {
            return;
        }


        const id =
            Number(button.dataset.id);


        if (!id) {
            return;
        }


        if (
            button.dataset.action === "edit"
        ) {

            await editArticle(id);

        }


        if (
            button.dataset.action === "delete"
        ) {

            await deleteArticle(id);

        }
    }
);


// ============================================================
// EDIT ARTICLE
// ============================================================

async function editArticle(id) {

    try {

        await requireSession();


        message(
            articleMessage,
            "Loading article..."
        );


        const {
            data,
            error
        } = await db
            .from("articles")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {

            console.error(
                "Edit article load error:",
                error
            );


            if (
                error.code === "42501" ||
                error.message
                    ?.toLowerCase()
                    .includes("row-level security")
            ) {

                throw new Error(
                    "Supabase blocked access to this article. " +
                    "Make sure authenticated users have a SELECT policy on the articles table."
                );
            }


            throw new Error(
                error.message
            );
        }


        if (!data) {
            throw new Error(
                "That article could not be found."
            );
        }


        // Store article being edited.
        editingArticle = data;


        // ----------------------------------------------------
        // FILL FORM
        // ----------------------------------------------------

        articleId.value = data.id;

        title.value =
            data.title || "";

        category.value =
            data.category || "School News";

        author.value =
            data.author || "PPW Staff";

        excerpt.value =
            data.excerpt || "";

        content.value =
            data.content || "";

        featured.checked =
            Boolean(data.featured);

        publishNow.checked =
            data.status === "published";


        // ----------------------------------------------------
        // PUBLICATION DATE
        // ----------------------------------------------------

        if (data.published_at) {

            const date =
                new Date(data.published_at);


            if (!Number.isNaN(date.getTime())) {

                const adjusted =
                    new Date(
                        date.getTime() -
                        date.getTimezoneOffset() * 60000
                    );


                publishedAt.value =
                    adjusted
                        .toISOString()
                        .slice(0, 16);
            }

        } else {

            publishedAt.value = "";

        }


        // ----------------------------------------------------
        // CURRENT IMAGE
        // ----------------------------------------------------

        if (data.image_url) {

            currentImage.src =
                data.image_url;

            currentImageWrap.classList.remove(
                "hidden"
            );

        } else {

            currentImageWrap.classList.add(
                "hidden"
            );

            currentImage.removeAttribute(
                "src"
            );
        }


        // ----------------------------------------------------
        // EDIT MODE
        // ----------------------------------------------------

        editorHeading.textContent =
            "Edit Article";

        cancelEditBtn.classList.remove(
            "hidden"
        );


        message(
            articleMessage,
            "Editing selected article."
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit article error:",
            error
        );


        message(
            articleMessage,
            error.message ||
                "Could not load this article.",
            "error"
        );
    }
}


// ============================================================
// DELETE ARTICLE
// ============================================================

async function deleteArticle(id) {

    const confirmed =
        window.confirm(
            "Delete this article? This cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        await requireSession();


        message(
            articleMessage,
            "Deleting article..."
        );


        const {
            error
        } = await db
            .from("articles")
            .delete()
            .eq("id", id);


        if (error) {

            console.error(
                "Delete article error:",
                error
            );


            if (
                error.code === "42501" ||
                error.message
                    ?.toLowerCase()
                    .includes("row-level security")
            ) {

                throw new Error(
                    "Supabase blocked the deletion with Row Level Security. " +
                    "Make sure your authenticated DELETE policy exists on the articles table."
                );
            }


            throw new Error(
                `Could not delete the article: ${error.message}`
            );
        }


        await loadArticles();


        message(
            articleMessage,
            "Article deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete article exception:",
            error
        );


        message(
            articleMessage,
            error.message ||
                "Something went wrong while deleting the article.",
            "error"
        );
    }
}


// ============================================================
// AUTH STATE
// ============================================================

db.auth.onAuthStateChange(
    async () => {

        try {
            await checkSession();
        } catch (error) {
            console.error(
                "Auth state change error:",
                error
            );
        }
    }
);


// ============================================================
// START
// ============================================================

checkSession();
