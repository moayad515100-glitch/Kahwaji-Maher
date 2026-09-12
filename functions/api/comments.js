const BIN_PRIMARY = "dfbfbef";
const BIN_BACKUP = "bbbacae";
const PRIMARY_URL = `https://extendsclass.com/api/json-storage/bin/${BIN_PRIMARY}`;
const BACKUP_URL = `https://extendsclass.com/api/json-storage/bin/${BIN_BACKUP}`;

function sanitizeComments(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(c => {
        if (!c || typeof c !== 'object') return false;
        if (!c.name || !c.text) return false;
        const nameStr = String(c.name).trim();
        const textStr = String(c.text).trim();
        
        // Remove mock comments
        if (c.id === 'c1' || c.id === 'c2' || c.id === 'c3') return false;
        if (nameStr.includes('أحمد العتيبي') || nameStr.includes('سارة الشمري') || nameStr.includes('فيصل مكة')) return false;
        if (textStr.includes('طعمها خرافي لا يُعلى عليه') || textStr.includes('الماتشا الباردة بطلة') || textStr.includes('أفضل قهوة في مكة')) return false;
        
        return true;
    });
}

async function fetchBinsData() {
    let list = [];
    try {
        const res = await fetch(PRIMARY_URL);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.comments)) list = data.comments;
        }
    } catch(e) {}

    // Fallback to backup if primary failed or empty
    if (list.length === 0) {
        try {
            const res = await fetch(BACKUP_URL);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.comments)) list = data.comments;
            }
        } catch(e) {}
    }

    return sanitizeComments(list);
}

async function saveToBins(commentsList) {
    const cleanList = sanitizeComments(commentsList);
    const payload = JSON.stringify({ comments: cleanList });

    const putHeaders = { "Content-Type": "application/json" };

    await Promise.allSettled([
        fetch(PRIMARY_URL, { method: "PUT", headers: putHeaders, body: payload }),
        fetch(BACKUP_URL, { method: "PUT", headers: putHeaders, body: payload })
    ]);

    return cleanList;
}

export async function onRequest(context) {
    const { request } = context;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    // Handle GET request
    if (request.method === "GET") {
        try {
            const comments = await fetchBinsData();
            return new Response(JSON.stringify({ comments }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
                }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message, comments: [] }), {
                status: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
    }

    // Handle POST/PUT request
    if (request.method === "POST" || request.method === "PUT") {
        try {
            const bodyText = await request.text();
            let payload = {};
            try { payload = JSON.parse(bodyText); } catch(e) {}

            // Fetch current remote data first
            const existingComments = await fetchBinsData();
            const commentMap = new Map();

            // Populate map with existing remote comments
            existingComments.forEach(c => {
                if (c && c.id) commentMap.set(c.id, c);
            });

            if (payload.action === 'delete' && payload.commentId) {
                commentMap.delete(payload.commentId);
            } else if (payload.action === 'like' && payload.commentId) {
                const target = commentMap.get(payload.commentId);
                if (target) {
                    target.likes = (target.likes || 0) + 1;
                }
            } else if (payload.newComment && payload.newComment.id) {
                commentMap.set(payload.newComment.id, payload.newComment);
            } else if (Array.isArray(payload.comments)) {
                payload.comments.forEach(c => {
                    if (c && c.id) commentMap.set(c.id, c);
                });
            }

            let mergedList = Array.from(commentMap.values());
            // Sort newest first
            mergedList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            const savedComments = await saveToBins(mergedList);

            return new Response(JSON.stringify({ success: true, comments: savedComments }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
                }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
    }

    return new Response("Method not allowed", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" }
    });
}
