const express = require("express");
const cors = require("cors");

// This package automatically parses JSON requests.
const bodyParser = require("body-parser");

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const { graphqlExpress, graphiqlExpress } = require("apollo-server-express");

const schema = require("./schema");

var app = express();

app.use(cors());
app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
app.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql"
  })
);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Atlas GraphQL server running on port ${PORT}.`);
});
