Gesture hints
This component you might have seen. It hints at what gesture to perform on a given prototype. I thought this would be a nice component to include in case you need it.

The component API looks something like this:

<Gesture.Drag y="down" />
<Gesture.Press />
You can even customise and combine directions to create a diagonal gesture path:

<Gesture.Drag x={32} y={-16} />
You can get the full source from the 
 action.