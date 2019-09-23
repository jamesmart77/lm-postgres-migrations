const pgtools = require("pgtools")

// Time out after 10 seconds - should probably be able to override this
const DEFAULT_TIMEOUT = 10000

module.exports = async function createDb(dbName, dbConfig = {}, config = {}) {
  const {user, password, host, port, ssl} = dbConfig;
  
  console.log("user: ", typeof user);
  console.log("password: ", typeof password);
  console.log("host: ", typeof host);
  console.log("port: ", typeof port);
  console.log("ssl: ", typeof ssl);
  
  if (typeof dbName !== "string") {
    throw new Error("Must pass database name as a string")
  }
  if (
    typeof user !== "string" ||
    typeof password !== "string" ||
    typeof host !== "string" ||
    typeof port !== "number" || 
    typeof ssl !== "boolean"
  ) {
    throw new Error("Database config problem")
  }

  return create(dbName, dbConfig, config)
}

async function create(dbName, dbConfig) {
  const {user, password, host, port, ssl} = dbConfig

  console.log(`Attempting to create database: ${dbName}`)

  // pgtools mutates its inputs (tut tut) so create our own object here
  const pgtoolsConfig = {
    database: dbConfig.defaultDbEngine || "postgres",
    user,
    password,
    host,
    port,
    ssl: ssl ? ssl : false
  }

  try {
    await pgtools
      .createdb(pgtoolsConfig, dbName)
      .timeout(
        DEFAULT_TIMEOUT,
        `Timed out trying to create database: ${dbName}`,
      ) // pgtools uses Bluebird
    console.log(`SUCCESS! Created database: ${dbName}`)
  } catch (err) {

    if (err.name === "duplicate_database") {
      console.error(`'${dbName}' database already exists`)
    } else {
      console.error("ERROR:", err)
      throw new Error(
        `Error creating database. Caused by: '${err.name}: ${err.message}'`,
      )
    }
  }
}
