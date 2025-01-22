
[![video](https://img.youtube.com/vi/nKCCoZmV2ls/0.jpg)](https://youtu.be/nKCCoZmV2ls)

I recommend watching the above **until 13:30** where the Angular client app implementation starts. 

I will soon upload React-based client app implementation content which the course will use.

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
The WebSocket API should be able to trigger different server events based on an "eventType" property in the JSON DTO sent to the API.
The goal is: **Send a ChatMessage DTO to the API**. The API must the send a **success message back to the client** AND **broadcast the message to all other clients**.

#### Instructions

I recommend you follow the instructions in this documentation to set up an event handler thus making the API capable of having different "events": [LINK](https://github.com/uldahlalex/uldahlalex.websocket.boilerplate/blob/master/README.md) 

Building the event handlers is based on the today's video material, so if you want a live demo, you can watch the video first.

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


### Exercise B is to be published soon...
<!-- 
#### Difficulty: ★★★☆☆

#### Task
The client app should both be capable of sending messages to the server and "reacting" to the events emitted by the server. Make a React app using ws-request-hook npm package in order to send messages to the API and react to server events sent back to the client.

#### Instructions

The following library has a custom hook to connect to a websocket server and perform actions upon certain events + "wait" for expected counter-events when sending messages.

#### How to test it: -->



<!-- This should be the result:  -->


</div>
</details>

<!-- #endregion ex B -->
_________

