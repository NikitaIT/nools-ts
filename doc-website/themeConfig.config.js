const subConfig = require("./subConfig.config.js");

module.exports = {
  navbar: {
    title: "Nools",
    logo: {
      alt: "Nools Logo",
      src: "img/logo.svg",
    },
    items: [
      {
        type: "docsVersionDropdown",
        position: "left",
      },
      {
        to: "resources/",
        activeBasePath: "resources",
        label: "Resources",
        position: "left",
      },
      { to: "blog", label: "Blog", position: "left" },
      {
        href: subConfig.repoUrl,
        label: "GitHub",
        position: "right",
      },
    ],
  },
  footer: {
    style: "dark",
    links: [
      {
        title: "Docs",
        items: [
          {
            label: "Style Guide",
            to: "docs/",
          },
          {
            label: "Second Doc",
            to: "docs/doc2/",
          },
        ],
      },
      {
        title: "Community",
        items: [
          {
            label: "Stack Overflow",
            href: "https://stackoverflow.com/questions/tagged/docusaurus",
          },
          {
            label: "Discord",
            href: "https://discordapp.com/invite/docusaurus",
          },
          {
            label: "Twitter",
            href: "https://twitter.com/docusaurus",
          },
        ],
      },
      {
        title: "More",
        items: [
          {
            label: "Blog",
            to: "blog",
          },
          {
            label: "GitHub",
            href: "https://github.com/facebook/docusaurus",
          },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} Nikita Fedorov, Built with Docusaurus.`,
  },
};
