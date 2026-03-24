Mask image
Alright, so, how about that sweet blur effect?

You might be thinking "oh I'll just apply it on the element with clip path".

Well not exactly, it would look horrible. Clip path would clip the blur effect and it would also not be a "progressive" blur 

Instead, we will animate another masked layer with a backdrop blur effect:

.fade {
  mask-image: linear-gradient(to left, #000 90%, transparent);
  backdrop-filter: blur(10px);
  animation: translate var(--duration) ease-in-out forwards;
}

@keyframes translate {
  to {
    transform: translateX(100%);
  }
}
This is already looking pretty sweet. Now with this strategy we can add any number of additional effect layers to create a more stunning composition.

Wait, but what the hell is mask-image 
2
 and how do we use it?

Well, you see, it sets the image that is used as the mask layer for an element, hiding sections of the element. Commonly, gradients are used as mask images.

The mask itself does not do anything, but if we apply a backdrop-filter 
3
 onto the mask layer, it will create this "progressive" blur effect against whatever is beneath. Further, we can throw in additional CSS filters like saturate() and they will similarly be applied progressively.

Again, you can fiddle with the draggable values 50% to get a better understanding for the property 

P.S. The #000 value is not important because the gradient does not actually render, it could be any solid color value. It is just important that one of the colors is transparent.