    const express = require("express");

    const app = express();

    app.use(express.json());

    const phongtroRoutes = require("./routes/phongtroroutes");
    const danhgiaRoutes = require("./routes/danhgiaroutes");

    app.use("/phongtro", phongtroRoutes);
    app.use("/phongtro", danhgiaRoutes);

    app.listen(3000, () => {
        console.log("🚀 Server running on port 3000");
    });