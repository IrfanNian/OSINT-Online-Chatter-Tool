const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let query = params.q;
document.title = `${query} | Keyword Usage`;

