const emailRoute = require("./src/routes/emai.route")

module.exports = ({ app }) => {
	emailRoute({app});
}
