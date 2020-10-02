const { prepareTemplate } = require("../utils");
const fs = require("fs");
const path = require("path");

const Letters = path.resolve(__dirname, "../", "letters");

var pdf = require("html-pdf");

const Mutations = {
  async createCarpet(parent, args, ctx, info) {
    console.log(args, "arguments");

    let acceptedFile = `${Letters}/new-order-pdf.html`;

    let date_delivery = new Date();
    date_delivery.setHours(new Date().getHours() + 48);

    let carpets = null;
    let totalPriceOrder = 0;
    if (args.carpets.length) {
      carpets = args.carpets
        .map(({ measure, pricePerMeter, id }) => {
          return {
            id,
            measure: measure,
            pricePerMeter: pricePerMeter,
            totalPrice: measure * pricePerMeter
          };
        })
        .filter(carpet => !carpet.id);

      // console.log("carpets", carpets);
      carpets.forEach(({ totalPrice }) => {
        console.log(totalPrice);
        totalPriceOrder += totalPrice;
      });
    }

    console.log(carpets);
    let phoneNumber = args.phoneNumber.toString();
    phoneNumber =
      "(" +
      phoneNumber.substring(0, 3) +
      ")" +
      phoneNumber.substring(3, 6) +
      "-" +
      phoneNumber.substring(6, 11);

    console.log(phoneNumber);

    const options = {
      customerName: "Damjan Radev",
      totalPrice: totalPriceOrder,
      carpets,
      address: args.address,
      phoneNumber
    };

    let example = await prepareTemplate("new-order-pdf", options);

    const data = {
      customer: args.customer,
      phoneNumber: args.phoneNumber,
      address: args.address,
      images: { set: args.images || [""] },
      date_add: new Date(),
      date_delivery,
      status: "Ordered",
      pickupTime: args.pickupTime

      // totalPrice: totalPriceOrder
    };

    let carpet = null;
    if (args.id) {
      carpet = await ctx.db.mutation.updateCarpet(
        {
          where: { id: args.id },
          data: { ...data, carpets: { create: carpets } }
        },
        info
      );
    } else {
      carpet = await ctx.db.mutation.createCarpet(
        {
          data: { ...data, carpets: { create: carpets } }
        },
        info
      );
    }

    // pdf
    //   .create(example.html)
    //   .toFile(
    //     `${Letters}/${carpet.id}-${args.customer
    //       .replace(/-/g, "")
    //       .replace(/ /g, "")}.pdf`,
    //     function(err, res) {
    //       console.log(res.filename);
    //     }
    //   );

    // console.log(carpet);
    return carpet;
  },
  async deleteCarpet(parent, args, ctx, info) {
    console.log(args);
    return await ctx.db.mutation.deleteCarpet({
      where: {
        id: args.id
      }
    });
  },
  async changeStatus(parent, args, ctx, info) {
    // console.log();

    const data = { status: args.status };
    // SET DELIVERY DATE 48 hours from now
    if (args.status === "Processing")
      data.date_delivery = new Date(
        new Date().setHours(new Date().getHours() + 48)
      );

    return await ctx.db.mutation.updateCarpet({
      where: {
        id: args.id
      },
      data
    });
  }
};

module.exports = Mutations;
