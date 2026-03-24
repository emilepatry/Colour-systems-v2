Grid stacking
Naturally, you would probably use absolute positioning and transform to lay two elements on each other:

.root {
  position: relative;
}

.item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
This works but means you now have to account for the translation if you were to animate transform:

.item:hover {
  transform: translate(-50%, -50%) scale(0.96);
}
With CSS Grid you can overlap elements with a lot less code by forcing the grid items onto the first row and column:

.root {
  display: grid;
  place-items: center;

  > * {
    grid-area: 1 / 1;
  }
}
Now you can use transform without relying on it for positioning, and the code looks simpler.