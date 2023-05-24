const { CosmosClient } = require("@azure/cosmos");

const endpoint = "https://-xxxxxxxxxxxxstg.documents.azure.com:443";
const key = "xxxxxxxxxxi5MQ==";
const databaseName = "peer-conne-db-stg";
const containerName = "stg-container";

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
