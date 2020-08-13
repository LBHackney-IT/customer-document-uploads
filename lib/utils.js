const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment-timezone');

generateRandomString = length => {
  let result = Math.random()
    .toString(36)
    .substring(2, length + 2);
  if (result.length < length)
    result += generateRandomString(length - result.length);
  return result.substring(0, length);
};

module.exports = {
  loadTemplates(directory) {
    const files = fs.readdirSync(directory);
    const partials = fs.readdirSync(`${directory}/partials`);

    // format dates
    moment.tz.setDefault('Europe/London');
    handlebars.registerHelper('dateFormat', context => {
      return moment(context).format('DD/MM/YYYY HH:mm');
    });

    // incrementor
    handlebars.registerHelper('inc', context => {
      return parseInt(context) + 1;
    });

    handlebars.registerHelper('toReviewCount', function(dropboxes) {
      return dropboxes.filter(x => !x.archived).length;
    });

    partials.forEach(partial => {
      if (partial.match(/.*\.hbs/)) {
        const f = fs.readFileSync(
          path.join(`${directory}/partials`, partial),
          'utf8'
        );
        handlebars.registerPartial(partial.replace('.hbs', ''), f);
      }
    });

    return files.reduce((acc, file) => {
      if (file.match(/.*\.hbs/)) {
        acc[`${file.replace('.hbs', '')}Template`] = handlebars.compile(
          fs.readFileSync(path.join(directory, file), 'utf8')
        );
      }
      return acc;
    }, {});
  },
  generateRandomString
};
