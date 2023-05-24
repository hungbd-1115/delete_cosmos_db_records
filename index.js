const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();


const endpoint = process.env.END_POINT;
const key = process.env.KEY;
const databaseName = process.env.DATABASE_NAME;
const containerName = process.env.CONTAINER_NAME;


const client = new CosmosClient({ endpoint, key });
const limit = 100;
var sum = 0;

async function main() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseName,
  });
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
  });

  let times = 1;

  while (true) {
    console.log(`* Times: ${times}`);
    const numberResource = await loop(container);
    times++;
    if (!numberResource) {
      break;
    }
  }
  console.log(`* Total: ${sum}`);
}

async function loop(container) {
  const { resources } = await container.items
    .query(`SELECT * from c OFFSET 0 LIMIT ${limit}`)
    .fetchAll();
  await deleteBatch(container, resources);

  return resources.length;
}

async function deleteBatch(container, resources) {
  const promises = resources.map((resource) =>
    container.item(resource.id, resource.partitionKey).delete()
  );
  await Promise.all(promises);
  console.log(`Deleted ${resources.length} items\r\n`);
  sum += resources.length;

}

main();
