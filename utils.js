const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

module.exports = {
  loadTemplates(directory) {
    var files = fs.readdirSync(directory);
    return files.reduce((acc, file) => {
      if (file.match(/.*\.hbs/)) {
        acc[`${file.replace('.hbs', '')}Template`] = handlebars.compile(
          fs.readFileSync(path.join(directory, file), 'utf8')
        );
      }
      return acc;
    }, {});
  }
};
