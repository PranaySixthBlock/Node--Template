var morgan = require("morgan");
var fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
// require('./passport');
if (process.env.NODE_ENV != "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("dev"));
  app.use(
    morgan("common", {
      stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
        flags: "a"
      }),
      skip: function(req, res) {
        return res.statusCode < 400;
      }
    })
  );
}
