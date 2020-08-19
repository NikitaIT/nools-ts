const subConfig = require("./subConfig.config.js");

module.exports = {
  title: "Nools",
  tagline: "The Nools",
  url: "https://nikitait.github.io",
  baseUrl: "/nools-ts/",
  onBrokenLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "nikitait", // Usually your GitHub org/user name.
  projectName: "nools-ts", // Usually your repo name.
  themeConfig: require("./themeConfig.config.js"),
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "docs",
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: "flow",
          //sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/nikitait/nools-ts/edit/master/doc-website/",
          remarkPlugins: [require("./src/plugins/remark-npm2yarn")],
          // disableVersioning: false,
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: subConfig.repoUrl,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "resources", // for 2 plugin docs
        homePageId: "resources",
        path: "./resources", // Path to data on filesystem, relative to site dir.
        routeBasePath: "resources", // URL Route.
        include: ["**/*.md"],
        sidebarPath: require.resolve("./sidebarsRes.js"),
        // Please change this to your repo.
        editUrl: "https://github.com/nikitait/nools-ts/edit/master/doc-website/",
        remarkPlugins: [require("./src/plugins/remark-npm2yarn")],
        disableVersioning: true,
      },
    ],
  ],
};
