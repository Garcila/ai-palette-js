const { Configuration, OpenAIApi } = require("openai");
const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAIApi(configuration);

async function get_colours(description) {
	let prompt = `You are a color palette generating machine. You are given a sentence and you have to generate a color palette for it. Return the colors in a JSON array of hex colors.
        Generate color palettes that fit the theme, mood or instruction in the prompt.
        The Palette should provide between 4 and 8 colors.

        Q: Convert the following description of a color palette into a color palette: healthy leaves
        A: ["#3D550C", "#81B622", "#ECF87F", "#59981A"]

        Q: Convert the following description of a color palette into a color palette: pastel dreams
        A: ["#FBE7C6", "#B4F8C8", "#A0E7E5", "#FFAEBC"]

        Q: Convert the following description of a color palette into a color palette: ${description}
        A:
    `;

	const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		max_tokens: 100,
	});
	const colors = await response.data.choices[0].text;
	return colors;
}

app.post("/palette", async (req, res) => {
	const query = req.query.query;
	const received_colors = await get_colours(query);
	const colors = JSON.parse(received_colors);
	res.json(colors);
});

app.get("/", async (req, res) => {
	res.render("index");
});

app.listen(port, () => {
	console.log(`The application is listening on port ${port}`);
});
