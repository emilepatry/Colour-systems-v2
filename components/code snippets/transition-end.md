Transition end
Did you know that there are two events available for knowing when an element stops animating: animationend and transitionend?

These can be useful to sync some UI with an animation, for example before scrolling to another heading you might want to wait until the sidebar closes 

You can actually set the event to be listened to only once like so:

function navigate(target: HTMLElement) {
  sidebarRef.current.addEventListener(
    "transitionend", 
    () => target.scrollIntoView(), 
    { once: true }
  );
  closeSidebar();
}
The listener is automatically cleaned up after the event fires once, so you don't have to worry about removing it.