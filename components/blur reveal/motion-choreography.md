Motion choreography
Consider this example where the animation duration is 5 seconds. The contents are revealed indeed, but without a convincing blur effect.

Like we talked about, the blur layer needs something underneath to blur. And because of the clipping there is nothing underneath if all animations run at the same speed!

What we want to ensure is that the clip path animation runs slightly ahead of the blur layer, so it creates further content area for the blur layer to do its thing.

In code, this would roughly translate to making the blur effect animation half as long:

const DURATION_CLIP = 5000; // 5s
const DURATION_BLUR = DURATION_CLIP + DURATION_CLIP / 2; // 7.5s