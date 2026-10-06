import { pool } from "./db/database"
pool
  .query("ALTER TABLE resources ADD COLUMN file_data BYTEA;")
  .then(() => {
    console.log("done")
    process.exit(0)
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
