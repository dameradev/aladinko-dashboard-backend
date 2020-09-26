const Handlebars = require("handlebars");

const Fs = require("fs");
const Path = require("path");
const Boom = require("boom");
const Util = require("util");
const pdf = require("html-pdf");

const ReadFile = Util.promisify(Fs.readFile);
const Templates = Path.resolve(__dirname, "email-templates/html");

function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  }
}

exports.prepareTemplate = async function(filename, options = {}) {
  try {
    // console.log(filename,options)

    const templatePath = Path.resolve(Templates, `${filename}.html`);
    const content = await ReadFile(templatePath, "utf8");

    const template = Handlebars.compile(content);
    const html = template(options);

    // const text = HtmlToText.fromString(html)

    return {
      html
      // text
    };
  } catch (error) {
    throw new Boom("Cannot read the email template content." + error);
  }
};

exports.hasPermission = hasPermission;
