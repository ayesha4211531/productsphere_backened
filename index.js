const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mount authentication routes matching the reference architecture
app.use("/", require("./routes/authRoutes"));

// Mount admin routes
app.use("/admin", require("./routes/adminRoutes"));

app.listen(port, () => {
  console.log(`🚀 Product Sphere B2B Server running on port ${port}`);
});
