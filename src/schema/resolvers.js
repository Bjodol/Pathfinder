const request = require("request");
const csv = require("csvtojson");

const spells = [];

console.log("Importing spells...");
csv()
  .fromStream(
    request.get(
      "https://docs.google.com/spreadsheets/d/1cuwb3QSvWDD7GG5McdvyyRBpqycYuKMRsXgyrvxvLFI/export?format=csv&id=1cuwb3QSvWDD7GG5McdvyyRBpqycYuKMRsXgyrvxvLFI&gid=838383682"
    )
  )
  .transf((jsonObj, csvRow, index) => {
    Object.keys(jsonObj).forEach(key => {
      if (jsonObj[key] == "NULL") {
        jsonObj[key] = null;
      }
      if (key === "wiz") {
        jsonObj["wizard"] = jsonObj[key];
        delete jsonObj[key];
      } else if (key === "sor") {
        jsonObj["sorcerer"] = jsonObj[key];
        delete jsonObj[key];
      }
    });
  })
  .on("json", jsonObj => {
    spells.push(jsonObj);
  })
  .on("done", error => {
    if (error) {
      console.error(error);
    } else {
      console.log(`${spells.length} spells imported!`);
      console.log("");
    }
  });

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
