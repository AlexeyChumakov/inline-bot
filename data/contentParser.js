const dataLoader = require("../utils/dataLoader");

class ContentParser {
  constructor() {
    this.content = dataLoader.loadJsonData("bot_content.json");
  }

  get(path) {
    const parts = path.split(".");
    let current = this.content;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  getMarketplaceInfo(marketplaceId, type) {
    const marketplace = this.get(`marketplaces.list`).find(
      (mp) => mp.id === marketplaceId
    );
    if (!marketplace) return null;

    if (type === "ordered") return marketplace.ordered.text;
    if (type === "planning") return marketplace.planning.text;
    return marketplace.intro_text;
  }

  getTransportInfo(transportId, type) {
    const transport = this.get(`transport_companies.list`).find(
      (tc) => tc.id === transportId
    );
    if (!transport) return null;

    if (type === "ordered") return transport.ordered.text;
    if (type === "planning") return transport.planning.text;
    return transport.intro_text;
  }

  getMarketplaceUrl(marketplaceId) {
    const marketplace = this.get(`marketplaces.list`).find(
      (mp) => mp.id === marketplaceId
    );
    return marketplace ? marketplace.url : "https://ftekrf.ru";
  }

  getTransportUrl(transportId) {
    const transport = this.get(`transport_companies.list`).find(
      (tc) => tc.id === transportId
    );
    return transport ? transport.url : "https://ftekrf.ru";
  }
}

module.exports = new ContentParser();

