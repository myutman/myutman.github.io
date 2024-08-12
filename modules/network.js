const BACKEND_URL = "https://cave-puzzle-3f21cce9636b.herokuapp.com";

export async function genField(N) {
    const field = await fetch(BACKEND_URL + `/gen-cave?field_size=${N}`, {
        method: "GET",
        headers: {
            "Content-type": "applications/json"
        }
    })
        .then((response) => response.json())
    console.log(field)

    return field;
}