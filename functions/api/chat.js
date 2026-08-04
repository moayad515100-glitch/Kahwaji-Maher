export async function onRequest(context) {
    const { request } = context;
    const targetBin = "ebbfecc";
    const targetUrl = `https://extendsclass.com/api/json-storage/bin/${targetBin}`;
    
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }
    
    // Handle GET request to read the master chat database
    if (request.method === "GET") {
        try {
            const res = await fetch(targetUrl);
            const data = await res.json();
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS"
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
    
    // Handle PUT request to update the master chat database
    if (request.method === "PUT") {
        try {
            const body = await request.text();
            const res = await fetch(targetUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: body
            });
            const data = await res.json();
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS"
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
