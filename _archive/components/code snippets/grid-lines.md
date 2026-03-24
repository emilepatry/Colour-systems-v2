Grid lines
You might have seen this debug rectangle around. It doesn't use a CSS border because you can't customise the gap on it.

So to customise the dashed border I would sometimes draw borders with a linear gradient to control the spacing:

.gridLine {
  --color: var(--color-orange);
  --size: 8px;

  &[data-direction="horizontal"] {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      to right,
      var(--color),
      var(--color) 50%,
      transparent 0,
      transparent
    );
    background-size: var(--size) 1px;
  }
}
You can get the full source from the 
 action.