const request = require("request");
const csv = require("csvtojson");

const spells = [];

console.log("Importing spells...");
csv()
  .fromStream(
    request.get(
      "https://docs.google.com/spreadsheets/d/0AhwDI9kFz9SddG5GNlY5bGNoS2VKVC11YXhMLTlDLUE/export?format=csv"
    )
  )
  .subscribe(json => {
    Object.keys(json).forEach(key => {
      if (json[key] == "NULL") {
        json[key] = null;
      }
      if (key === "wiz") {
        json["wizard"] = json[key];
        delete json[key];
      } else if (key === "sor") {
        json["sorcerer"] = json[key];
        delete json[key];
      }
    });
    spells.push(json);
  })
  .then(error => {
    console.log(`${spells.length} spells imported!`);
    console.log("");
  }).catch(e => console.error(e));

module.exports = {
  Query: {
    spells: (root, params) => {
      console.log();
      const queryKeys = Object.keys(params);
      if (queryKeys.length === 0) {
        console.log("No filter");
        return spells;
      }
      let results = spells;
      console.log(`Query Keys: ${queryKeys}, length: ${queryKeys.length}`);
      queryKeys.forEach(key => {
        console.log(`Applying filter: ${key} = ${params[key]}`);
        if (key === "class") {
          results = results.filter(spell => {
            return spell[params[key]] > -1 && spell[params[key]];
          });
        } else {
          results = results.filter(spell => {
            if (
              (!spell[key] && spell[key] !== 0) ||
              (!params[key] && params[key] !== 0)
            )
              return false;
            // console.log(`Applying filter ${key}: Spell Value = ${spell[key]}, Search Value = ${params[key]}`)
            if (typeof params[key] === "number") {
              return parseInt(spell[key], 10) === parseInt(params[key], 10);
            } else if (typeof params[key] === "string") {
              return spell[key]
                .toLowerCase()
                .includes(params[key].toLowerCase());
            }
            return false;
          });
        }
        console.log(`Results length: ${results.length}`);
      });
      return results;
    },
    search: (root, { search }) => {
      let results = spells;
      console.log(`Search key: ${search}`);
      results = results.filter(spell => {
        return (
          Object.keys(spell).filter(key => {
            return (spell[key] || "")
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase());
          }).length > 0
        );
      });
      console.log(`Results length: ${results.length}`);
      return results;
    }
  }
};
