# Nodify
----------
An general purpose application for drawing nodes and connection between nodes using a terminal backed by custom or user defined commands and a drawing canvas, running on top of the ElectronJS framework.

## Use cases

- Nodify can be used to draw anything that contains nodes and edges between them, such as tree data structures or automatas from formal languages. <br/>
- Currently the application supports nodes of type:
  
| Type       | Details                                      |
| ---------- | -------------------------------------------- |
| CircleNode | A simple node instance the shape of a circle |

More types to be added in the future.

## Highlight Features
- Terminal interface using commands to interact with the canvas for drawing.
- Customizable commands suiting all drawing needs created using standard JS + NodifyAPI
- Animations for nodes and edges (color, position, size, etc)
- Exporting capabilities under PNG, SVG & GIF for animations
- Cloud storage and loading using a mongoDB atlas account
- Sharing project/canvas on e-mail
  
### Standard Features
- Save/Load project from local or cloud
- Undo/redo functionality (ctrl+, & ctrl+.)
- Interface customizability (fonts, sizes, colors)


## Basic utilization
Opening the application we are presented with a drawing canvas and a terminal in the bottom of the screen. Writing commands can be done just as in any other terminal. Functionalities such as upArrow & downArrow history are supported along side standard CTRL+{C V X} shortcuts.<br><br>
One can start drawing by simply typing commands inside the terminal. <br> Nodify comes prepacked with a suite of commands to get the user started. If any command available doesn't suit the user, it is free to create it's own.<br>
For listing all the available commands anytime type:
```javascript
terminal$> list
```
```javascript
terminal$> Available commands (3):
[Output] cn - basic node creation
[Output] un - basic node update
[Output] dn - node deletion
[Output] For mode information type: help <command-name>
```
## User Guide
### Exporting
### Exporting images
The application supports exporting images in **PNG** , **JPEG**, **SVG** formats through the use of the **Export** context menu. Nodify will save all the canvas data currently displayed in the image, not only a specific region. A save dialog will open if any of those are to be choosen.
### Exporting animations
Animations of actions that take place can also be captured and exported under the **GIF** format. Capturing a **GIF** involves three simple steps:
1. Toggle enable capture
2. Do the drawing (base animations or chain of commands)
3. Toggle disable capture

In the first step, the user must click **Toggle Capture GIF** from the **Export** menu and a pop-up will apprear telling the user that all following commands will be recorded into the GIF data as frames of animation. Visually, a red border will be present around the perimeter of the canvas. Step can be aborted.<br/>
In the following step, the user can input any command and the frames will be recorded into a buffer later used for creating the GIF. <br/>
When the user decides it got enough frames of animation, the **Toggle Capture GIF** button must be clicked again to stop the recording. A pop-up will apprear showing the processing progress of the operation (cannot abort). Finally a save dialog will appear. <br/>
</br>
#### Available Preferences
The user have the ability to modify parameters in regards to how the GIF is captured and processed. Those options are available in the **Exporting** tab under the **Preferences** context menu:
| Option         | Details                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Delay          | Sets time between GIF captured frames in miliseconds                                                                                                               |
| Frames to skip | Regulates how many frames of animation are skipped. Usefull for longer animations with little changes. Higher number increases performance at the cost of accuracy |
| Quality        | Sets the quality of the produced GIF. Lower values imply a lower GIF quality                                                                                       |


```WARNING``` <br/>
In case the user forgets to **disable** the recording after a reasonable number of frames have been captured, the application will toggle disable automatically even if the user didn't finish the animation. This is so to protect against high memory usage.

### Sharing
```TO BE DONE```
### Commands
Commands are used in the terminal in order to manipulate the canvas (what it's drawn) and they are a medium that facilitates repetitive tasks by incapsulation of logic inside them. <br/>
```NOTE``` <br/> Newly created commands are not taken into account unless the application is restarted or the user explicitly reloads the commands using the **Reload commands** option in the **File** tab.

#### Structure
From a structure point of view, commands are just regular JavaScript files containing a **schema** block and a **logic** block contained inside a JavaScript object. The **schema** block dictates what arguments the command can accept along with their respective type. The **logic** block is a function taking in the parsed arguments of the user input and, using the internal API, modifies the canvas by drawing inside it.
```javascript
root = {
    "schema": {
        "name": 'create.node',
        "mandatory": ["id"],
        "id": "Number",
        // other arguments
    },
    async logic(parsedData, API) {
        // code..
    }
}
```
```NOTE``` The **logic** block is in fact in **async** function. This is due to the fact of how animations work and that they need to be awaited in some situations.

#### The Schema Block
The schema block defines the command name, a list of mandatory arguments and the arguments with their respective needed type. There is no limit on how many arguments a command can have **but** the same argument cannot be defined twice.<br/>
The name of the function can be choosen by the user and the application won't care as long as there isn't already another command with this name. In that case the application will just **discard this duplicate command** created and warn the user about it. <br/>
The argument names are choosen by the user and are not subject to any restrictions, however the argument type, that defines how it will be parsed, is imposed and it must be of one of the following types:
| Type         | Example argument          | Parsed                                   |
| ------------ | ------------------------- | ---------------------------------------- |
| String       | car                       | "car"                                    |
| String2      | car,apple                 | ["car", "apple"]                         |
| Stringv      | car,apple, ...            | ["car", "apple", ...]                    |
| String2vs    | car,apple\|orange,banana  | [["car", "apple"], ["orange", "banana"]] |
| Stringvs     | apple\|orange,banana\|... | [["apple"], ["orange", "banana"], ...]   |
| AbsNumber    | 3                         | 3                                        |
| AbsNumber2   | 4,5                       | [4,5]                                    |
| AbsNumberv   | 4,5,6, ...                | [4,5,6, ...]                             |
| AbsNumber2vs | 1,2\|4,5\| ...            | [[1,2],[4,5], ...]                       |
| AbsNumbervs  | 1\|4,5\|2 ...             | [[1],[4,5],[2] ...]                      |
| Number       | -3                        | -3                                       |
| Number2      | 4,-5                      | [4,-5]                                   |
| Numberv      | 4,5,-6, ...               | [4,5,-6, ...]                            |
| Number2vs    | 1,-2\|-4,5\| ...          | [[1,-2],[-4,5], ...]                     |
| Numbervs     | -1\|4,5\|2 ...            | [[-1],[4,5],[2] ...]                     |
| NotRequired  | -                         | -                                        |
| Boolean      | true                      | true (logical)                           |


#### Example of schemas
```javascript
    // ...
    // Possible schema of command that radialy creates node of radius 'radius' around 
    // position 'pos' with a color of 'color'
    // The 'pos' however is mandatory to be provided
    // Possible invoke: $> radial.nodes pos 200,300 radius 20 color red
    "schema": {
        "name": 'radial.nodes',
        "mandatory": ["pos"],
        "pos": "AbsNumber2vs",
        "radius": "AbsNumber",
        "color": "String"
        // other arguments
    }
    // ...
}
```
```javascript
    // ...
    // Possible schema of command that joins 'ids' of nodes with a connection for each
    // node linearly (1->2->3->..)
    // Possible invoke: $> join.nodes ids 1,2,3
    "schema": {
        "name": 'join.nodes',
        "mandatory": ["ids"],
        "ids": "AbsNumberv",
        // other arguments
    }
    // ...
}
```
#### The Logic Block
This block controlls the behaviour of the command. It tells the canvas where and how to draw the nodes and edges using a series of API calls defined internally. <br/>
At it's programatic core, the logic block is an async function called ```logic``` taking in the ```parsedData``` from the command parsing stage, and an ```API``` object that holds the necessary internal API calls the user might need.
```javascript
    async logic(parsedData, API) {
        // code..
    }
```
```NOTE``` The two parameters are name agnostic, so any name for those two paramaters would do, but the recommended names are highly advised to be used. <br/><br/>

The ```parsedData``` parameter is an object that contains all the parsed command arguments in the form of a javascript object. Any valid parameter can be accessed using the dot operator. <br/>
The ```API``` parameter, as mentioned before, is a javascript object that contains API function calls that act directly on the state of the canvas. Those functions are predefined ones and are limited to what options they can take in. Those functions can be: 
| Name & Syntax                          | Details                                                                                       |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| createNodeSync(type, opts)             | Creates a node of type with specified opts synchronously. Returns created node id             |
| createNode(type, opts)                 | Creates a node of type with specified opts asynchronously. Upon await returns created node id |
| updateNodeSync(id, opts)               | Updates a node with specified opts synchronously                                              |
| updateNode(id, opts)                   | Updates a node with specified opts asynchronously                                             |
| deleteNodeSync(id)                     | Deletes a node synchronously                                                                  |
| createConnectionSync(idFrom,idTo,opts) | Creates a connection between ids with specified opts synchronously                            |
| createConnection(idFrom,idTo,opts)     | Creates a connection between ids with specified opts asynchronously                           |
| updateConnectionSync(idFrom,idTo,opts) | Updates a connection between ids with specified opts synchronously                            |
| updateConnection(idFrom,idTo,opts)     | Updates a connection between ids with specified opts asynchronously                           |
| deleteConnection(idFrom,idTo)          | Deletes a connection between ids synchronously                                                |

```NOTE``` The above 'opts' is a javascript object, 'id*' is a simple unsigned integer and 'type' is an unsigned integer from a predefined range: 
| Int | Type       |
| --- | ---------- |
| 0   | CircleNode |


The options object argument is limited in what options it can actually take and depends on the node and connection currently supported options. <br/>
As with the command schema, the options are composed of an option name (is predefined) and a type. Failing to satisfy the type of the option results in an error and failing to provide supported options will result in no changes. <br/>
A list of options for the currently available objects:

##### Options supported on CircleNodes
| Name     | Type       | Details                                      |
| -------- | ---------- | -------------------------------------------- |
| position | AbsNumber2 | Sets the position of the node                |
| radius   | AbsNumber  | Sets the radius of the node                  |
| color    | String     | Sets the color of the node                   |
| indexed  | Boolean    | Enables or disables the index above the node |
| TBA      | TBA        | TBA                                          |

##### Options supported on Standard Connections
| Name      | Type   | Details                                |
| --------- | ------ | -------------------------------------- |
| elevation | Number | Sets the bezier elevation of the curve |
| color     | String | Sets the color of the node             |
| text      | String | Puts a standard text on the connection |
| TBA       | TBA    | TBA                                    |


In the context of this internal API, synchronously means that one API call needs to return before executing the other API calls, while asynchronously means the API calls go file one after another without waiting for any other call to finish. <br/>
This async behaviour leaves the oportunity to animate multiple nodes/edges at the same time, and not only one after the other (as with simple sync). <br/> <br/>
```WARNING``` One caviat of the current implementation is that when creating nodes async and after that, in the same command, we try to connect those nodes, the operation will fail because the javascript promise that makes this async possible, hasn't returned yet. The workaround to this is to create two separate commands, one for node creationg and the other for node connection.

#### Example of logic
```javascript
root = {
    //...
    // Assumes 'pos' is defined in the schema and that is is of type AbsNumber2vs
    // Logic will create nodes at positions from the 'pos' vector with a radius of 30,  // synchronously
    async logic(parsedData, API) {
        for(const pos : parsedData.pos)
            api.createNodeSync(0, { position: pos, radius: 30})
    }
}
```
```javascript
root = {
    //...
    // Assumes 'pos' is defined in the schema and that is is of type AbsNumber2vs
    // Assumes 'color' is defined in the schema and that is is of type Stringv
    // Logic will create nodes at positions from the 'pos' with color 'color',  
    // synchronously and then join each node with each other node sync,
    // making a complete tree
    async logic(parsedData, API) {
        const positions = parsedData.pos
        const colors = parsedData.color
        let nodeList = []

        for(let index of positions.length)
        {
            const nodeId = api.createNodeSync(0, { 
                            position: positions[index],
                            color: colors[index] })
            nodeList.push(nodeId)
        }

        for (let i = 0; i < nodeIds.length; i++ 1)
            for (let j = i; j < nodeIds.length; j++)
                if (i != j)
                    api.createConnectionSync(nodeIds[i], nodeIds[j], {})
    }
}
```

#### The internal API
#### Creating your own command
### Animations
#### How do animations work?
#### Animation structure
#### Available options
## Developers Guide
### Adding new API calls
### Custom renderable objects
### Implementing new input validation rules
