import { app } from "./app";
import { envConfig } from "./config/env";

app.listen(envConfig.port, "0.0.0.0", () => {
  console.log(`Server is running on port ${envConfig.port}.`);
});
