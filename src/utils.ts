const Path = require("path");
const Url = require("url").URL;

export const getValidKeyAndRequire = (key, prevPath) => {
    const urlConfig = new Url(prevPath);

    const currPath = Path.join(urlConfig.pathname, `../${key}`);

    if (key.startsWith("./") || key.startsWith("../")) {
        // 判断是否是style文件
        if (key.endsWith("style")) {
            const tempStr = `${urlConfig.origin +
                currPath.replace(/\\/g, "/")}/index.css`;
            return {
                value: tempStr,
                key: tempStr,
                isRemote: true
            };
        }
        if (key.endsWith(".css")) {
            const tempStr = `${urlConfig.origin + currPath.replace(/\\/g, "/")}`;
            return {
                value: tempStr,
                key: tempStr,
                isRemote: true
            };
        }
        // 判断是否是图片文件
        // Todo
        // 判断是否是json文件
        // Todo
        // 则最后则是js文件
        const tempStr = `${urlConfig.origin +
            currPath.replace(/\\/g, "/") +
            (key.endsWith(".js") ? "" : ".js")}`;
        return {
            value: tempStr,
            key: tempStr,
            isRemote: true
        };
    }

    return {
        key,
        value: key,
        isRemote: false
    };
};