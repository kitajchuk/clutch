module.exports = {
    apps: [
        {
            name: "clutch",
            script: "./server/app.js",
            env: {
                NODE_ENV: "sandbox"
            },
            watch: ["server", "template"],
            watch_delay: 1000,
            ignore_watch : ["node_modules"],
            watch_options: {
                "followSymlinks": false
            }
        }
    ]
};
