export async function onRequest(context) {
    const { request } = context;
    const targetBin = "dfbfbef";
    const targetUrl = `https://extendsclass.com/api/json-storage/bin/${targetBin}`;

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

    // Handle GET request: Return all public comments
    if (request.method === "GET") {
        try {
            const res = await fetch(targetUrl);
            const data = await res.json();
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
                }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
    }

    // Handle POST/PUT request: Save updated comments array or append new comment
    if (request.method === "POST" || request.method === "PUT") {
        try {
            const bodyText = await request.text();
            const payload = JSON.parse(bodyText);

            // Fetch current data first to append safely
            let currentData = { comments: [] };
            try {
                const getRes = await fetch(targetUrl);
                currentData = await getRes.json();
                if (!Array.isArray(currentData.comments)) currentData.comments = [];
            } catch(e) {}

            if (payload.action === 'like' && payload.commentId) {
                // Handle Like increment
                const targetComment = currentData.comments.find(c => c.id === payload.commentId);
                if (targetComment) {
                    targetComment.likes = (targetComment.likes || 0) + 1;
                }
            } else if (payload.newComment) {
                // Add new comment to the top of list
                currentData.comments.unshift(payload.newComment);
            } else if (Array.isArray(payload.comments)) {
                // Direct full comments replacement
                currentData.comments = payload.comments;
            }

            const putRes = await fetch(targetUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentData)
            });

            await putRes.json();
            return new Response(JSON.stringify({ success: true, comments: currentData.comments }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS"
                }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
    }

    return new Response("Method not allowed", { 
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" }
    });
}
