export default {
    async fetch(request, env) {
        // Serve the request from the assets binding
        return env.ASSETS.fetch(request);
    },
};
