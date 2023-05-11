const { CosmosClient } = require("@azure/cosmos");

const endpoint = '';
const key = '';
const databaseName = ''
const containerName = ''

const client = new CosmosClient({ endpoint, key });

async function main() {
    const { database } = await client.databases.createIfNotExists({ id: databaseName });
    const { container } = await database.containers.createIfNotExists({ id: containerName });

    const { resources } = await container.items
        .query("SELECT * from c")
        .fetchAll();

    for (const resource of resources) {
        await container.item(resource.id, resource.partitionKey).delete();
    }

    console.log('done');
}

main();