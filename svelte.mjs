// Usage:
// <script type="module" src="//hyrious.me/embed/svelte.mjs?bf2dc2c549bb40888da00d6ec6b32b99"></script>

let me;
for (const script of document.scripts) {
  if (script.src === import.meta.url) {
    me = script;
    break;
  }
}

if (!me) {
  throw new Error("not found script with src =", import.meta.url);
}

const { searchParams } = new URL(import.meta.url);

const test_id = RegExp.prototype.test.bind(/^[0-9a-f]{32}$|^[./]/);
const id = Array.from(searchParams.keys()).find(test_id) || "hello-world";

const container = document.createElement("div");
container.className = "svelte-repl";
container.textContent = `loading ${id}`;

me.replaceWith(container);

// ===========================================================================

function basename(name) {
  let i = name.lastIndexOf("/");
  let j = name.lastIndexOf(".");
  if (j === -1) j = undefined;
  return name.slice(i + 1, j);
}

function extname(name) {
  let j = name.lastIndexOf(".");
  return j === -1 ? "" : name.slice(j + 1);
}

function proxy(url) {
  return "https://hyrious.vercel.app/api/get?url=" + url;
}

let json;
if (/^[./]/.test(id)) {
  const source = await fetch(id).then((r) => r.text());
  json = {
    id: "local",
    name: "local",
    owner: null,
    components: [{ name: basename(id), type: extname(id), source }],
  };
} else {
  const url = `https://svelte.dev/repl/${id}.json`;
  json = await fetch(proxy(url)).then((r) => r.json());
}

const radio_id = Math.random().toString(36).slice(2);

function create_radio(value, title) {
  const radio = document.createElement("input");
  radio.name = radio_id;
  radio.type = "radio";
  radio.value = value;
  const label = document.createElement("label");
  label.append(radio, title);
  return { radio, label };
}

const pre = document.createElement("pre");
const code = document.createElement("code");
pre.className = "svelte-repl-source";
pre.append(code);

// register '.svelte'
if (typeof hljs < "u") {
  hljs.registerLanguage("svelte", (hljs) => ({
    subLanguage: "xml",
    contains: [
      hljs.COMMENT("<!--", "-->", { relevance: 10 }),
      {
        begin: /^(\s*)(<script((\s*lang=".*")|(\s*context="module"))?>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: [
          { begin: /^(\s*)(\$:)/gm, end: /(\s*)/gm, className: "keyword" },
        ],
      },
      {
        begin: /^(\s*)(<style.*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\{/gm,
        end: /\}/gm,
        subLanguage: "javascript",
        contains: [
          { begin: /[\{]/, end: /[\}]/, skip: true },
          {
            begin:
              /([#:\/@])(if|else|each|const|await|then|catch|debug|html)/gm,
            className: "keyword",
            relevance: 10,
          },
        ],
      },
    ],
  }));
}

function run_hljs() {
  if (typeof hljs < "u") {
    hljs.highlightElement(code);
  }
}

function update_tab() {
  const index = +this.dataset.index;
  const { type, source } = json.components[index];
  code.className = "language-" + type;
  code.textContent = source;
  run_hljs();
}

const tabs = document.createElement("div");
tabs.className = "svelte-repl-tabs";
for (let i = 0; i < json.components.length; ++i) {
  const { name, type, source } = json.components[i];
  const { radio, label } = create_radio(String(i), name + "." + type);
  radio.dataset.index = String(i);
  radio.oninput = update_tab;
  tabs.append(label);
  if (i === 0) {
    radio.checked = true;
    code.className = "language-" + type;
    code.textContent = source;
  }
}

const playSVG = `<svg aria-hidden="true" role="img" class="iconify iconify--ic" width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z"></path></svg>`;
const closeSVG = `<svg aria-hidden="true" role="img" class="iconify iconify--ic" width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path></svg>`;

const run = document.createElement("button");
run.className = "svelte-repl-run";
run.title = "Run";
run.innerHTML = playSVG;

const style = document.createElement("style");
style.textContent = `
  .svelte-repl {
    --primary: #ff3e00;
    display: flex;
    flex-flow: column nowrap;
    border: 1px dashed;
    position: relative;
  }
  .svelte-repl-tabs {
    display: flex;
    align-items: center;
    padding: .25em .25em 0;
  }
  .svelte-repl-tabs label {
    display: inline-flex;
    align-items: center;
    position: relative;
    padding: .25em .5em;
    border-bottom: 1px solid transparent;
    font-size: .8em;
  }
  .svelte-repl-tabs label:has(:checked) {
    border-bottom-color: var(--primary);
  }
  .svelte-repl-tabs > * + * {
    margin-left: -1px;
  }
  .svelte-repl-tabs label input {
    visibility: hidden;
    position: absolute;
    margin: 0;
    inset: 0;
  }
  .svelte-repl-run {
    position: absolute;
    top: .25em;
    right: .25em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2em;
    height: 2em;
    border: 0;
    padding: 0;
    background: none;
  }
  .svelte-repl-run:hover {
    color: var(--primary);
  }
  .svelte-repl-source {
    margin: 0;
    tab-size: 2;
    font-size: 1em;
  }
  .svelte-repl-source code.hljs {
    padding: .5em;
  }
  .svelte-repl-result {
    border: 0;
    border-top: 1px dashed;
    resize: vertical;
  }
`;

const iframe = document.createElement("iframe");
iframe.className = "svelte-repl-result";
iframe.style.display = "none";
iframe.sandbox =
  "allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals allow-same-origin";

container.innerHTML = "";
container.append(style, tabs, run, pre, iframe);

run_hljs();

run.onclick = async function run() {
  if (this.dataset.done) {
    iframe.style.display = "none";
    this.dataset.done = "";
    this.innerHTML = playSVG;
  } else {
    this.dataset.done = "true";
    this.innerHTML = closeSVG;
    await run_bundle();
    iframe.style.display = "";
  }
};

let rollup, resolve;

const ready = (async function init_svelte() {
  const rollup_ = import(
    "https://unpkg.com/@rollup/browser/dist/es/rollup.browser.js"
  );

  const resolve_ = import("https://unpkg.com/resolve.exports/dist/index.mjs");

  let version = searchParams.get("version");
  version = version ? "@" + version : "";

  let svelte_;
  try {
    svelte_ = await import(`https://unpkg.com/svelte${version}/compiler.mjs`);
    window.svelte = svelte_;
  } catch (err) {
    console.warn(err);
    const script = document.createElement("script");
    const promise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    document.head.append(script);
    script.src = `https://unpkg.com/svelte${version}/compiler.js`;
    await promise.finally(() => script.remove());
  }

  rollup = await rollup_;
  resolve = await resolve_;

  console.log("rollup %s, svelte %s", rollup.VERSION, svelte.VERSION);

  return { rollup, svelte };
})();

let cache = new Map();

const ABORT = { aborted: true };

const FETCH_CACHE = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetch_if_uncached(url) {
  if (FETCH_CACHE.has(url)) {
    return FETCH_CACHE.get(url);
  }

  await sleep(200);

  const promise = fetch(url)
    .then(async (r) => {
      if (!r.ok) throw new Error(await r.text());

      return {
        url: r.url,
        body: await r.text(),
      };
    })
    .catch((err) => {
      FETCH_CACHE.delete(url);
      throw err;
    });

  FETCH_CACHE.set(url, promise);
  return promise;
}

async function follow_redirects(url) {
  const res = await fetch_if_uncached(url);
  return res?.url;
}

async function resolve_from_pkg(pkg, subpath, pkg_url_base) {
  if (typeof pkg.svelte === "string" && subpath === ".") {
    return pkg.svelte;
  }

  if (pkg.exports) {
    try {
      const [resolved] =
        resolve.exports(pkg, subpath, {
          browser: true,
          conditions: ["svelte", "production"],
        }) ?? [];

      return resolved;
    } catch {
      throw `no matched export path was found in "${pkg_name}/package.json"`;
    }
  }

  if (subpath === ".") {
    const resolved_id = resolve.legacy(pkg, {
      fields: ["browser", "module", "main"],
    });

    if (!resolved_id) {
      for (const index_file of ["index.mjs", "index.js"]) {
        try {
          const indexUrl = new URL(index_file, `${pkg_url_base}/`).href;
          return (await follow_redirects(indexUrl)) ?? "";
        } catch {
          // maybe the next option will be successful
        }
      }

      throw `could not find entry point in "${pkg_name}/package.json"`;
    }

    return resolved_id;
  }

  if (typeof pkg.browser === "object") {
    return resolve.legacy(pkg, {
      browser: subpath,
    });
  }

  return subpath;
}

async function run_bundle() {
  const { rollup, svelte } = await ready;

  const packages_url = "https://unpkg.com";
  const svelte_url = "https://unpkg.com/svelte";

  function compare_to_version(major, minor, patch) {
    const v = svelte.VERSION.match(/^(\d+)\.(\d+)\.(\d+)/);
    return +v[1] - major || +v[2] - minor || +v[3] - patch;
  }

  function is_legacy_package_structure() {
    return compare_to_version(3, 4, 4) <= 0;
  }

  function has_loopGuardTimeout_feature() {
    return compare_to_version(3, 14, 0) >= 0;
  }

  const lookup = new Map();
  for (const file of json.components) {
    lookup.set("./" + file.name + "." + file.type, file);
  }

  const new_cache = new Map();

  const bundle = await rollup.rollup({
    input: "./App.svelte",
    plugins: [
      {
        name: "svelte-repl",
        async resolveId(importee, importer) {
          if (importee === "svelte") return svelte_url + "/index.mjs";
          if (importee.startsWith("svelte/")) {
            return is_legacy_package_structure()
              ? `${svelte_url}/${importee.slice(7)}.mjs`
              : `${svelte_url}/${importee.slice(7)}/index.mjs`;
          }
          if (importer && importer.startsWith(svelte_url)) {
            const resolved = new URL(importee, importer).href;
            if (resolved.endsWith(".mjs")) return resolved;
            return is_legacy_package_structure()
              ? `${resolved}.mjs`
              : `${resolved}/index.mjs`;
          }

          if (lookup.has(importee) && (!importer || lookup.has(importer)))
            return importee;
          if (lookup.has(importee + ".js")) return importee + ".js";
          if (lookup.has(importee + ".json")) return importee + ".json";

          if (importee.endsWith("/")) importee = importee.slice(0, -1);

          if (importee.startsWith("http:") || importee.startsWith("https:"))
            return importee;

          if (importee.startsWith(".")) {
            const url = new URL(importee, importer).href;
            console.log("resolving", url);

            return await follow_redirects(url);
          } else {
            console.log("resolving", importee);

            const match = /^((?:@[^/]+\/)?[^/]+)(\/.+)?$/.exec(importee);
            if (!match) {
              throw new Error(`Invalid import "${importee}"`);
            }

            const pkg_name = match[1];
            const subpath = `.${match[2] ?? ""}`;

            const fetch_package_info = async () => {
              try {
                const pkg_url = await follow_redirects(
                  `${packages_url}/${pkg_name}/package.json`
                );

                if (!pkg_url) throw new Error();

                const pkg_json = (await fetch_if_uncached(pkg_url))?.body;
                const pkg = JSON.parse(pkg_json ?? '"');

                const pkg_url_base = pkg_url.replace(/\/package\.json$/, "");

                return {
                  pkg,
                  pkg_url_base,
                };
              } catch (_e) {
                throw new Error(
                  `Error fetching "${pkg_name}" from unpkg. Does the package exist?`
                );
              }
            };

            const { pkg, pkg_url_base } = await fetch_package_info();

            try {
              const resolved_id = await resolve_from_pkg(
                pkg,
                subpath,
                pkg_url_base
              );
              return new URL(resolved_id + "", `${pkg_url_base}/`).href;
            } catch (reason) {
              throw new Error(`Cannot import "${importee}": ${reason}.`);
            }
          }
        },
        async load(resolved) {
          const cached_file = lookup.get(resolved);
          if (cached_file) return cached_file.source;

          if (!FETCH_CACHE.has(resolved)) {
            console.log("fetching", resolved);
          }

          const res = await fetch_if_uncached(resolved);
          return res?.body;
        },
        transform(code, id) {
          console.log("bundling", id);

          if (!/\.svelte$/.test(id)) return null;

          const name = id.split("/").pop()?.split(".")[0];

          const cached_id = cache.get(id);
          const result =
            cached_id && cached_id.code === code
              ? cached_id.result
              : svelte.compile(code, {
                  generate: "dom",
                  format: "esm",
                  dev: true,
                  filename: name + ".svelte",
                  ...(has_loopGuardTimeout_feature() && {
                    loopGuardTimeout: 100,
                  }),
                });

          new_cache.set(id, { code, result });

          return result.js;
        },
      },
    ],
  });

  cache = new_cache;

  const output = await bundle.generate({
    format: "iife",
    name: "SvelteComponent",
    exports: "named",
    sourcemap: true,
  });

  const result = output?.output[0];

  iframe.srcdoc = "";
  iframe.srcdoc = `<!DOCTYPE html><html><head><script>
    window.addEventListener('message', function handle_message(ev) {
      if (ev.data.script) eval(ev.data.script);
    })
  </script></head><body></body></html>`;

  const script = `
    if (window.component) {
      try {
        window.component.$destroy();
      } catch (err) {
        console.error(err);
      }
    }

    document.body.innerHTML = '';
    window.location.hash = '';

    ${result.code}

    window.component = new SvelteComponent.default({
      target: document.body
    });
  `;

  iframe.onload = () => {
    iframe.contentWindow?.postMessage({ script });
  };
}
