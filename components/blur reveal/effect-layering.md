Effect layering
Hopefully from the prior example you could see how layering different elements can create interesting effect compositions.

For example, you could add another noise layer and blend everything together with mix-blend-mode 
4

.blur {
  mask-image: linear-gradient(to left, #000 90%, transparent);
  backdrop-filter: blur(10px) saturate(300%);
}

.noise {
  mix-blend-mode: color-burn;
}
I can't give you a pre-determined formula for effects. Usually it is just about messing with different blend modes and moving layers around until you get something good looking.