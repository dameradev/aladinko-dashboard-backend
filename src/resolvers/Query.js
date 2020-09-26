const { forwardTo } = require("prisma-binding");
const Query = {
    async carpets (parent, args, ctx, info) {
        return await ctx.db.query.carpets({orderBy: "date_add_DESC"}).catch(error => console.error(error));
        // .carpets({ orderBy: "name_ASC" })
        
  
    }
};

module.exports = Query;
