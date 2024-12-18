const Sitemap = require("react-router-sitemap").default;
const path = require("path");

const routes = [
  "/",
  "/Contact",
  "/Events",
  "/Team",
  "/CTFs",
];

const generateSitemap = () => {
  return new Sitemap({ baseUrl: "https://hackopsgitam.live", routes })
    .build("https://hackopsgitam.live")
    .save(path.resolve(__dirname, "public/sitemap.xml"));
};

generateSitemap();
