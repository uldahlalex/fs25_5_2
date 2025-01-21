
[![video](https://img.youtube.com/vi/nKCCoZmV2ls/0.jpg)](https://youtu.be/nKCCoZmV2ls)

I recommend watching the above until 13:30 where the Angular implementation starts. Instead i recommend you watch the following about building React client implementation: (todo)

#### Remote repo for today's lesson with solutions: (https://github.com/uldahlalex/fs25_5_2)



### Agenda

- 08:15: 

### Topics:

- Event Handlers (how to make WebSocket API "endpoints")
- Event driven architecture
- How to make client app react to different server emmitted events


### Exercises


<!-- #region ex A -->

<details>
    <summary>Exercise A: Implementing Event Handler</summary>


<div style="margin: 20px; padding: 5px;  box-shadow: 10px 10px 10px grey;">

#### Difficulty: ★★☆☆☆


#### Task
Use this event handler library to implement a basic event handler for a WebSocket API. 
The server event must be capable to saving an object to a database and returning it to all clients connected to the WebSocket API.

#### Instructions

I recommend you follow the instructions in this documentation:


#### How to test it:

You can test the API with the Postman Desktop client. I have an example WebSocket connection + message in my Fullstack 2025 workspace: https://www.postman.com/uldahlalexteam/fullstack-2025-workspace/ws-raw-request/678e3e5669c951396fd62e94

This should be the result:
![img.png](img.png)


</div>
</details>

<!-- #endregion ex A -->
_________

<!-- #region ex B -->

<details>
    <summary>Exercise B: The client implementation</summary>


<div style="margin: 20px; padding: 5px;  box-shadow: 10px 10px 10px grey;">

#### Difficulty: ★★★☆☆


#### Task
The client app should both be capable of sending messages to the server and "reacting" to the events emitted by the server. Make a React app using ws-request-hook npm package in order to send messages to the API and react to server events sent back to the client.

#### Instructions

The following library has a custom hook to connect to a websocket server and perform actions upon certain events + "wait" for expected counter-events when sending messages.

#### How to test it:



This should be the result: 


</div>
</details>

<!-- #endregion ex B -->
_________

