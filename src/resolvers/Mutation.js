const { prepareTemplate } = require("../utils");
const fs = require("fs");
const path = require("path");

const Letters = path.resolve(__dirname, "../", "letters");

var pdf = require("html-pdf");

const Mutations = {
  async createCarpet(parent, args, ctx, info) {
    console.log(args);

    let acceptedFile = `${Letters}/new-order-pdf.html`;

    let date_delivery = new Date();
    date_delivery.setHours(new Date().getHours() + 48);

    const carpets = args.carpets.map(({ measure, pricePerMeter }) => {
      return {
        measure: measure,
        pricePerMeter: pricePerMeter,
        totalPrice: measure * pricePerMeter
      };
    });

    let totalPriceOrder = 0;
    carpets.forEach(({ totalPrice }) => {
      console.log(totalPrice);
      totalPriceOrder += totalPrice;
    });

    console.log(args.phoneNumber);
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

    console.log("TotalPrice=>", totalPriceOrder);
    const carpet = await ctx.db.mutation.createCarpet(
      {
        data: {
          customer: args.customer,
          phoneNumber: args.phoneNumber,
          address: args.address,
          images: { set: args.images },
          date_add: new Date(),
          date_delivery,
          status: "Ordered",
          carpets: { create: carpets }
          // totalPrice: totalPriceOrder
        }
      },
      info
    );

    pdf
      .create(example.html)
      .toFile(
        `${Letters}/${carpet.id}-${args.customer
          .replace(/-/g, "")
          .replace(/ /g, "")}.pdf`,
        function(err, res) {
          console.log(res.filename);
        }
      );

    console.log(carpet);
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
