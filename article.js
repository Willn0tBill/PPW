const SUPABASE_URL="https://qyipadinsphoyxotrceo.supabase.co";

const SUPABASE_KEY=
    "sb_publishable_S73dZKZ9ro03lWDbHFzZhw_5t5pDtGt";

const {createClient}=supabase;

const db=
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


const container=
    document.getElementById(
        "articleContent"
    );


const slug=
    new URLSearchParams(
        location.search
    ).get("slug");


/* =====================================================
   ESCAPE HTML
===================================================== */

function esc(v){

    return String(v??"")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   ARTICLE BODY
===================================================== */

function bodyHtml(v){

    return String(v||"")
        .split(
            /\n\s*\n/
        )
        .map(
            p=>p.trim()
        )
        .filter(
            Boolean
        )
        .map(
            p=>
                `<p>
                    ${esc(p)
                        .replace(
                            /\n/g,
                            "<br>"
                        )}
                </p>`
        )
        .join("");

}


/* =====================================================
   LOAD ARTICLE
===================================================== */

async function load(){

    /* No slug */
    if(!slug){

        container.innerHTML=
            `
            <div class="article-error">

                <h1>
                    Article not found
                </h1>

                <p>
                    No article was selected.
                </p>

            </div>
            `;

        return;
    }


    /* Get published article */
    const {data,error}=
        await db
            .from("articles")
            .select("*")
            .eq(
                "slug",
                slug
            )
            .eq(
                "status",
                "published"
            )
            .single();


    /* Article doesn't exist */
    if(error||!data){

        container.innerHTML=
            `
            <div class="article-error">

                <h1>
                    Article not found
                </h1>

                <p>
                    This article may have been removed
                    or is not published.
                </p>

            </div>
            `;

        return;
    }


    /* Update browser title */

    document.title=
        `${data.title} | Paw Prints Weekly`;


    /* Article image */

    const image=
        data.image_url

        ? `
            <img
                class="article-hero-image"
                src="${esc(data.image_url)}"
                alt="${esc(data.title)}"
            >
          `

        : "";


    /* Article date */

    const date=
        data.published_at

        ? new Date(
            data.published_at
        ).toLocaleDateString(
            "en-US",
            {
                month:"long",
                day:"numeric",
                year:"numeric"
            }
        )

        : "";


    /* Build article */

    container.innerHTML=
        `
        <span class="category">
            ${esc(
                data.category
            ).toUpperCase()}
        </span>

        <h1>
            ${esc(data.title)}
        </h1>

        <div class="article-byline">

            By ${esc(data.author)}
            ·
            ${esc(date)}

        </div>

        ${image}

        <div class="article-body">

            ${bodyHtml(
                data.content
            )}

        </div>
        `;

}


/* =====================================================
   START
===================================================== */

load();
