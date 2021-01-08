import nengi from "nengi";
import nengiConfig from "../common/nengiConfig";

function instantiateClient(secret) {
  return new Promise((resolve, reject) => {
      const client = new nengi.Client(nengiConfig)

      client.onConnect(res => {
          console.log('onConnect response:', res)
          if (!res.accepted) {
              reject(res);
          } else {
              resolve(client);
          }
      })
  
      client.connect('ws://localhost:8079', { secret })
  })
}

export default instantiateClient;
