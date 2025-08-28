const express = require("express");
const routes = require("./routes");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
    res.send("Welcome to TheMini Crossword Backend!");
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, "../../themini-frontend/dist")));

// Catch-all route to serve index.html for unmatched routes (Vue router support)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../themini-frontend/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
