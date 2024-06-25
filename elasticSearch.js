const { Client } = require('@elastic/elasticsearch');

// const client = new Client({ node: 'http://localhost:9200' });

// async function testConnection() {
//   try {
//     const health = await client.cluster.health();
//     console.log(health);
//   } catch (error) {
//     console.error('Elasticsearch connection failed:', error);
//   }
// }

// testConnection();

// const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  cloud: {
    id: '820d16c949b04d8b9948bbbe32cd49e7:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNhNTk2Y2JmNWY0MTRjOGJiYTgxYTkwZDIwM2RiZTgxJDNmMzVlNmE2NWJiYzQxZWFhM2ZjMTQ3ZjdjZTVlOGI2', // Replace with your Elastic Cloud ID
  },
  auth: {
    username: 'elastic', // Replace with your Elasticsearch username
    password: '4i08Q8sUlQ2xVUQxZU6mbHjw'  // Replace with your Elasticsearch password
  }
});

// Example function to check connection
async function checkConnection() {
  try {
    const health = await client.cluster.health();
    console.log('Elasticsearch cluster health:', health);
  } catch (error) {
    console.error('Elasticsearch connection error:', error);
  }
}

checkConnection();
