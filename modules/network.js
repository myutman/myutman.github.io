const BACKEND_URL = "https://cave-puzzle-3f21cce9636b.herokuapp.com";
// const BACKEND_URL = "http://backend.com:5432";

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

export async function checkSolved(field, field_colors) {
    let body = JSON.stringify({
        field: field,
        field_colors: field_colors
    });
    console.log(body);
    

    const solved = await fetch(BACKEND_URL + `/check-solution`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    })
        .then((response) => response.json())
        .catch((e) => console.log(e))

    console.log(solved)

    return solved["solved"];
}