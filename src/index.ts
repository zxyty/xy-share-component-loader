import { getValidKeyAndRequire } from "./utils";
import { requestFile } from "./request";

const Path = require("path");
const Fs = require("fs");

const requireDepsPath = Path.join(
  process.cwd(),
  "./node_modules/remote-share-components/_remotePack.js"
);


try {
  Fs.unlinkSync(requireDepsPath);
} catch (error) {
  Fs.writeFileSync(requireDepsPath, "", {
    encoding: "utf-8"
  });
}

const requireReg = /require\(('|")([\s\S]*?)('|")\)/g;

module.exports = function remoteLoader() {
  let result: any[] = [];

  let config: {
    [key: string]: any
  } = {};
  try {
    // eslint-disable-next-line import/no-dynamic-require
    config = require(Path.join(process.cwd(), "./remote-component-config.js"));
  } catch (error) {
    console.warn(error);
  }

  return {
    visitor: {
      JSXElement(path) {
        if (path.node.openingElement.name.name === "RemoteComponent") {
          const targetRemoteComponent = path.node.openingElement.attributes.find(
            c => c.name.name === "url"
          );

          if (!targetRemoteComponent || !targetRemoteComponent.value.value) {
            return;
          }

          let { value: targetRemoteComponentUrl } = targetRemoteComponent.value;

          if (!targetRemoteComponentUrl) {
            return;
          }

          if (!targetRemoteComponentUrl.endsWith(".js")) {
            targetRemoteComponentUrl += ".js";
          }

          const alias = config.alias || {};
          let tempAlias = "";
          const hasAliasPrefix = Object.keys(alias).find(c => {
            if (targetRemoteComponentUrl.startsWith(c)) {
              tempAlias = c;
              return true;
            }
            return false;
          });

          if (hasAliasPrefix) {
            targetRemoteComponentUrl = targetRemoteComponentUrl.replace(
              tempAlias,
              alias[tempAlias] || ""
            );
            // 修改babel tree Node
            targetRemoteComponent.value.value = targetRemoteComponentUrl;
          }

          requestFile(targetRemoteComponentUrl).then((data: string) => {
            const matchResult = data.match(requireReg);
            if (!matchResult) {
              return;
            }
            // console.log(matchResult);
            result = [
              ...result,
              ...matchResult
                .map(c => {
                  if (!c) {
                    return null;
                  }
                  const keyReg = /"([\s\S]*?)"/g;
                  const matchKeys = c.match(keyReg)!;
                  const key = matchKeys[0].replace(/"/g, "");

                  const {
                    key: validKey,
                    value,
                    isRemote
                  } = getValidKeyAndRequire(key, targetRemoteComponentUrl);

                  if (result.find(d => Object.keys(d)[0] === validKey)) {
                    return null;
                  }

                  return {
                    [validKey]: isRemote ? value : c
                  };
                })
                .filter(c => c)
            ];

            Fs.writeFileSync(
              requireDepsPath,
              `
export default ${JSON.stringify(result)}      
            `
                .replace(/"require\(\\"/g, 'require("')
                .replace(/\\"\)"/g, '")')
            );
          });
        }
      }
    }
  };
};
