const Http = require("http");
const Url = require("url").URL;


export const requestFile = url => {
    return new Promise((res, rej) => {
        const urlConfig = new Url(url);

        const options = {
            hostname: urlConfig.hostname,
            port: urlConfig.port,
            path: urlConfig.pathname,
            method: "GET"
        };

        let data;
        const req = Http.request(options, re => {
            re.setEncoding("utf8");
            re.on("data", chunk => {
                data += chunk;
            });
            re.on("end", () => {
                res(data);
            });
        });

        req.on("error", e => {
            rej(e);
        });

        req.end();
    });
};

