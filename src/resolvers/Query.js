const { forwardTo } = require("prisma-binding");
const Query = {
    carpets: forwardTo("db")
};

module.exports = Query;
