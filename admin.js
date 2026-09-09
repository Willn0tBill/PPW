const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";
const SUPABASE_KEY="sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";
const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_KEY);

const loginView=document.getElementById("loginView"),adminView=document.getElementById("adminView");
const loginForm=document.getElementById("loginForm"),loginMessage=document.getElementById("loginMessage");
const articleForm=document.getElementById("articleForm"),articleId=document.getElementById("articleId");
const title=document.getElementById("title"),category=document.getElementById("category"),author=document.getElementById("author");
const excerpt=document.getElementById("excerpt"),content=document.getElementById("content"),publishedAt=document.getElementById("publishedAt");
const imageFile=document.getElementById("imageFile"),featured=document.getElementById("featured"),publishNow=document.getElementById("publishNow");
const articleMessage=document.getElementById("articleMessage"),articleList=document.getElementById("articleList");
const editorHeading=document.getElementById("editorHeading"),cancelEditBtn=document.getElementById("cancelEditBtn");
const currentImageWrap=document.getElementById("currentImageWrap"),currentImage=document.getElementById("currentImage");

let editingArticle=null;


/* =====================================================
   HELPERS
===================================================== */

function escapeHtml(v){
    return String(v??"")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function slugify(v){
    return v
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g,"")
        .replace(/\s+/g,"-")
        .replace(/-+/g,"-")
        .slice(0,90);
}

function message(el,text,type=""){
    el.textContent=text;
    el.className=`message ${type}`;
}

function formatDate(v){
    return v
        ? new Date(v).toLocaleDateString(
            "en-US",
            {
                month:"short",
                day:"numeric",
                year:"numeric"
            }
        )
        : "No date";
}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm(){

    articleForm.reset();

    articleId.value="";

    author.value="PPW Staff";

    publishNow.checked=true;

    featured.checked=false;

    editingArticle=null;

    editorHeading.textContent="Create Article";

    cancelEditBtn.classList.add("hidden");

    currentImageWrap.classList.add("hidden");

    currentImage.removeAttribute("src");

    message(articleMessage,"");
}


/* =====================================================
   AUTH / SESSION
===================================================== */

async function checkSession(){

    const {data}=await db.auth.getSession();

    if(data.session){

        loginView.classList.add("hidden");

        adminView.classList.remove("hidden");

        loadArticles();

    }else{

        adminView.classList.add("hidden");

        loginView.classList.remove("hidden");

    }
}


/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit",async e=>{

    e.preventDefault();

    message(
        loginMessage,
        "Signing in..."
    );

    const email=
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password=
        document
            .getElementById("loginPassword")
            .value;

    const {error}=
        await db.auth.signInWithPassword({
            email,
            password
        });

    if(error){

        message(
            loginMessage,
            error.message,
            "error"
        );

        return;
    }

    loginForm.reset();

    message(loginMessage,"");

    checkSession();

});


/* =====================================================
   LOGOUT / BUTTONS
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async()=>{
            
            await db.auth.signOut();

            resetForm();

            checkSession();

        }
    );

document
    .getElementById("refreshBtn")
    .addEventListener(
        "click",
        loadArticles
    );

cancelEditBtn.addEventListener(
    "click",
    resetForm
);


/* =====================================================
   IMAGE UPLOAD
===================================================== */

async function uploadImage(file){

    if(!file) return null;

    const ext=
        (file.name.split(".").pop()||"jpg")
        .toLowerCase();

    const safe=
        ["jpg","jpeg","png","webp","gif"]
        .includes(ext)
        ? ext
        : "jpg";

    const path=
        `articles/${crypto.randomUUID()}.${safe}`;

    const {error}=
        await db
            .storage
            .from("article-images")
            .upload(
                path,
                file,
                {
                    cacheControl:"3600",
                    upsert:false
                }
            );

    if(error){
        throw error;
    }

    return db
        .storage
        .from("article-images")
        .getPublicUrl(path)
        .data
        .publicUrl;
}


/* =====================================================
   SAVE ARTICLE
===================================================== */

async function saveArticle(status){

    const session=
        (await db.auth.getSession())
        .data
        .session;

    if(!session){

        throw new Error(
            "Your session expired. Please sign in again."
        );

    }

    const headline=
        title.value.trim();

    const body=
        content.value.trim();

    if(!headline||!body){

        throw new Error(
            "Please enter both a headline and the article text."
        );

    }

    let imageUrl=
        editingArticle?.image_url||null;

    if(imageFile.files[0]){

        imageUrl=
            await uploadImage(
                imageFile.files[0]
            );

    }

    const dateValue=
        publishedAt.value
        ? new Date(
            publishedAt.value
        ).toISOString()
        : new Date().toISOString();

    const data={

        title:headline,

        slug:
            (
                editingArticle &&
                editingArticle.title===headline
            )
            ? editingArticle.slug
            : slugify(headline),

        excerpt:
            excerpt.value.trim(),

        content:
            body,

        category:
            category.value,

        author:
            author.value.trim()||
            "PPW Staff",

        image_url:
            imageUrl,

        published_at:
            status==="published"
            ? dateValue
            : null,

        status:
            status,

        featured:
            featured.checked,

        updated_at:
            new Date().toISOString()

    };


    const result=
        editingArticle

        ? await db
            .from("articles")
            .update(data)
            .eq(
                "id",
                editingArticle.id
            )

        : await db
            .from("articles")
            .insert(data);


    if(result.error){

        if(
            result.error.code==="23505"
        ){

            throw new Error(
                "A similar article headline already exists. Change the headline slightly."
            );

        }

        throw result.error;

    }

    resetForm();

    await loadArticles();

    return status;
}


/* =====================================================
   PUBLISH ARTICLE
===================================================== */

articleForm.addEventListener(
    "submit",
    async e=>{

        e.preventDefault();

        try{

            message(
                articleMessage,
                "Publishing..."
            );

            await saveArticle(
                "published"
            );

            message(
                articleMessage,
                "Article published successfully.",
                "success"
            );

        }catch(err){

            message(
                articleMessage,
                err.message||
                "Something went wrong.",
                "error"
            );

        }

    }
);


/* =====================================================
   SAVE DRAFT
===================================================== */

document
    .getElementById("saveDraftBtn")
    .addEventListener(
        "click",
        async()=>{

            try{

                message(
                    articleMessage,
                    "Saving draft..."
                );

                await saveArticle(
                    "draft"
                );

                message(
                    articleMessage,
                    "Draft saved successfully.",
                    "success"
                );

            }catch(err){

                message(
                    articleMessage,
                    err.message||
                    "Something went wrong.",
                    "error"
                );

            }

        }
    );


/* =====================================================
   LOAD ARTICLES
===================================================== */

async function loadArticles(){

    articleList.innerHTML=
        '<div class="empty-state">Loading articles...</div>';

    const {data,error}=
        await db
            .from("articles")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );

    if(error){

        articleList.innerHTML=
            `<div class="empty-state">
                Could not load articles:
                ${escapeHtml(error.message)}
            </div>`;

        return;
    }

    if(!data.length){

        articleList.innerHTML=
            '<div class="empty-state">No articles yet. Create your first story.</div>';

        return;
    }


    articleList.innerHTML=
        data
        .map(a=>{

            const image=
                a.image_url

                ? `<img
                        class="article-thumb"
                        src="${escapeHtml(a.image_url)}"
                        alt=""
                   >`

                : '<div class="article-thumb"></div>';


            return `
                <article class="article-item">

                    ${image}

                    <div>

                        <div class="article-item-top">

                            <div>

                                <h3>
                                    ${escapeHtml(a.title)}
                                </h3>

                                <p>
                                    ${escapeHtml(a.category)}
                                    ·
                                    ${escapeHtml(a.author)}
                                    ·
                                    ${formatDate(
                                        a.published_at||
                                        a.created_at
                                    )}
                                </p>

                            </div>

                            <span class="badge ${a.status}">
                                ${a.status.toUpperCase()}
                            </span>

                        </div>

                        <div class="article-actions">

                            <button
                                class="small-btn"
                                data-action="edit"
                                data-id="${a.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="small-btn"
                                data-action="delete"
                                data-id="${a.id}"
                            >
                                Delete
                            </button>

                            ${
                                a.status==="published"

                                ? `
                                    <a
                                        class="small-btn"
                                        href="article.html?slug=${encodeURIComponent(a.slug)}"
                                        target="_blank"
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
}


/* =====================================================
   ARTICLE ACTIONS
===================================================== */

articleList.addEventListener(
    "click",
    async e=>{

        const b=
            e.target.closest(
                "[data-action]"
            );

        if(!b) return;

        const id=
            Number(
                b.dataset.id
            );

        if(
            b.dataset.action==="edit"
        ){

            await editArticle(id);

        }

        if(
            b.dataset.action==="delete"
        ){

            await deleteArticle(id);

        }

    }
);


/* =====================================================
   EDIT ARTICLE
===================================================== */

async function editArticle(id){

    const {data,error}=
        await db
            .from("articles")
            .select("*")
            .eq("id",id)
            .single();

    if(error){

        message(
            articleMessage,
            error.message,
            "error"
        );

        return;
    }

    editingArticle=data;

    articleId.value=
        data.id;

    title.value=
        data.title||"";

    category.value=
        data.category||
        "School News";

    author.value=
        data.author||
        "PPW Staff";

    excerpt.value=
        data.excerpt||"";

    content.value=
        data.content||"";

    featured.checked=
        Boolean(
            data.featured
        );

    publishNow.checked=
        data.status==="published";


    if(data.published_at){

        const d=
            new Date(
                data.published_at
            );

        const adjusted=
            new Date(
                d.getTime()-
                d.getTimezoneOffset()*60000
            );

        publishedAt.value=
            adjusted
            .toISOString()
            .slice(
                0,
                16
            );

    }else{

        publishedAt.value="";

    }


    if(data.image_url){

        currentImage.src=
            data.image_url;

        currentImageWrap
            .classList
            .remove("hidden");

    }else{

        currentImageWrap
            .classList
            .add("hidden");

    }


    editorHeading.textContent=
        "Edit Article";

    cancelEditBtn
        .classList
        .remove("hidden");


    message(
        articleMessage,
        "Editing selected article."
    );

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


/* =====================================================
   DELETE ARTICLE
===================================================== */

async function deleteArticle(id){

    if(
        !window.confirm(
            "Delete this article? This cannot be undone."
        )
    ){

        return;

    }

    const {error}=
        await db
            .from("articles")
            .delete()
            .eq(
                "id",
                id
            );

    if(error){

        message(
            articleMessage,
            error.message,
            "error"
        );

        return;
    }

    await loadArticles();

    message(
        articleMessage,
        "Article deleted.",
        "success"
    );
}


/* =====================================================
   AUTH STATE
===================================================== */

db.auth.onAuthStateChange(
    ()=>{
        checkSession();
    }
);

checkSession();
