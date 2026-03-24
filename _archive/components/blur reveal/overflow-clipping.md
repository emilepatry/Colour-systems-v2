Overflow clipping
Finally, we need to understand what to do with the effect layers once the animation completes. Not figuring this out made me not use this effect in many places because the animation would affect surrounding content.

Consider this example: the animation contents have a sibling element that is not part of the animation container.

How would you make sure the effect layers don't affect surrounding content?

Alright, so my first instinct was to just apply overflow-x: hidden to the parent.

Wait, what? It doesn't at all do what I would expect. Now there's a scroll container and both horizontal and vertical overflow is hidden.

To my surprise, there is a new value for overflow called clip 
5
 that does exactly what you want—prevents overflow on only one axis without creating a scroll container. Hell yeah!