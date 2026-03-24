How do you name props? Why are enum props good? What the hell is composability and why is it useful? Should you always use React?

If you've ever thought about these questions then you're in the right place. I'm not preaching absolute truth but merely some personal preferences and understandings of what makes a good React component.

Contextual props
A common flaw I see in naming props for components is duplication of context.

Consider this example:

<Dialog
  isDialogOpen={isDialogOpen}
  onDialogClose={() => setIsDialogOpen(false)}
/>
The props for controlling the dialog state also include the word "dialog". But in no way does this make it more clear what the props are doing. Omitting the duplication doesn't lose meaning, but makes using the component more ergonomic because you have to type less.

<Dialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
/>
Notice how the state is isDialogOpen yet the component takes an isOpen prop.

You might have a parent component that has a ton of logic, so it would make sense to keep the state naming verbose so it is obvious what the open state controls, but on the component level the prop can become terse because of the additional context provided by  Dialog

const [isDialogOpen, setIsDialogOpen] = useState(false);

// hundreds of lines later...

<Dialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
/>
However, if you're making a subset component of a dialog primitive—say a dialog for billing management—it is completely sufficient to name the state isOpen, not isDialogOpen, because the surrounding context still communicates that the state relates to a dialog:

function BillingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  return <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
}
This principle of "contextual naming" applies to all kinds of props. Consider this example:

<Pattern colorVariable="--color-blue-200" />
Now, the colorVariable prop already tells me that this is a color and a variable. We can omit both parts from the actual prop value, and append the necessary prefixes in the component:

 <Pattern colorVariable="--color-blue-200" />
 <Pattern colorVariable="blue-200" />
To reduce even further, one could argue that the notion of a "variable" in the prop name is overcontextual and could also be omitted without losing clarity:

 <Pattern colorVariable="blue-200" />
 <Pattern color="blue-200" />
Derived props
Let's continue with the dialog example. What if you wanted the  Dialog to not be closable?

I have seen this several times in various codebases. Most people just add an isClosable boolean prop to the component:

<Dialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  isClosable={false}
/>
The problem here is that such an impromptu approach to adding single use case props to components usually ends up with having components with 20 props and having to do a lot of mental gymnastics to figure out how all the boolean combinations work together.

Instead, for such behavior we can reuse the existing onClose prop. If it is passed, we should consider the dialog closable, and if not, then it is not closable!

<Dialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  isClosable={false}
/>
This is just one example, but a good rule of thumb is that if you're adding a boolean prop to a component, you should consider if it can be derived from any existing props.

Enum props
Now boolean props are fine, don't get me wrong. But consider this flawed example, what should the  Button look like?

<Button isPrimary isSecondary />
It is an impossible state, you can't reasonably expect a button to be of both primary and secondary state. Enum props make impossible states impossible:

<Button variant="primary" />
<Button variant="secondary" />
Further, you get better autocomplete support for enum props as you type out the prop, and get to pass the variant prop into a data attribute for styling:

function Button({ children, variant }) {
  return (
    <button className="button" data-variant={variant}>
      {children}
    </button>
  );
}
Isn't this more pleasing to work with over conditionally setting classes?

function Button({ children, isPrimary, isSecondary }) {
  return (
    <button className={isPrimary ? "primary" : isSecondary ? "secondary" : ""}>
      {children}
    </button>
  );
}
Alright, so what if I have an enum prop but I want it to also accept any arbitrary value?

Consider this button that has a preset of design system colors but you want it to also accept a random color, like a HEX code:

interface ButtonProps {
  color: "accent" | "warning" | string;
}
It makes sense to type it with string, right? Well, kind of... but you lose the autocomplete functionality in code editors. To retain autocomplete for your design system values, you can type the string like so:

interface ButtonProps {
  color: "accent" | "warning" | string;
  color: "accent" | "warning" | (string & {});
}
Why does this make sense? I have no idea, but I found it on the internet and it works.

Composability
You've likely seen some components from Radix UI or Base UI that have multiple components that are used together. This is called a compound component.

<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Label />
      <DropdownMenu.Item />
      <DropdownMenu.Separator />
      <DropdownMenu.Arrow />
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
But you might be wondering, isn't this a lot of boilerplate? Yes and no. These libraries are intentionally low-level, meaning they expose internal parts for you to hook into, avoiding prop bloat that component libraries usually suffer from due to all kinds of use case requests.

Why do this? Well, you now have control over every element rendered as part of the dropdown. Want to add a class name to the separator? Just add it to the component, no passing in nasty separatorClassName props down from the parent. Don't want an arrow for the menu? Just don't render it, no need for a hasArrow boolean prop.

Generally, you would wrap a low-level collection of components into a high-level component that uses parts of it to make a dropdown menu for your design system.

Now, the name of the game here is composability. Consider this example of the  Slides component powering this page:

<Slides>
  <Slide title="Prop naming">
    <p>...</p>
  </Slide>
  <Slide title="Composability">
    <p>...</p>
  </Slide>
</Slides>
It's not just beautiful to look at but easier to navigate through visually. Compare this to an inferior component that just takes in a data prop:

<Slides 
  data={[
    {
      title: "Prop naming",
      children: <p>...</p>,
    },
    {
      title: "Composability",
      children: <p>...</p>,
    }
  ]} 
/>
Yikes. Not only are have we lost JSX, but if you wanted to pass in any additional attributes to each item, you would have to make sure the data prop supports them.

This approach is often attractive because you have access to the entire collection of items from  Slides. You can easily determine which item is active or selected.

With composition, you need each descendant to register itself in a collection with a reference to the HTML element, and pass it the active state:

function Slides({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useRef<HTMLDivElement[]>([]);

  return (
    <div>
      {React.Children.map(
        children,
        (child, index) => {
          return React.cloneElement(child, {
            ref: (node) => {
              slides.current[index] = node;
            },
            active: activeIndex === index,
          });
        }
      )}
    </div>
  )
}


function Slide({ children, title, active }) {
  // ...
}
Now, this approach generally works fine but has its limitations. There would be bugs here if the children were to change because it doesn't handle removing elements from the list when a component unmounts. This is a really hard problem exclusive to React. If you're curious, I recommend looking at how Radix builds their components with the collection utility.

Finally, to create compound components, I've found this approach to work well:

function Root() {}
function Slide() {}

export const Slides = Object.assign(Root, { Slide });

// ...
<Slides>
 <Slides.Slide />
</Slides>
Direct manipulation
Often times animation or interaction libraries manipulate the DOM directly, instead of relying on React to reconcile diffs between the virtual and actual DOM.

Try panning or moving your mouse around to observe how slow high-frequency React updates from interactions can be with a complex document 

7
Render count
(50 FPS)
Instead, if you know what you're doing and other parts of your interface don't rely on this state, it is much more performant to update the element directly from the callback because it doesn't trigger a re-render:

const ref = useRef(null);

function onMouseMove(e) {
  ref.current.style.translate = `${e.clientX}px ${e.clientY}px`;
}

<div onMouseMove={onMouseMove}>
  <div ref={ref} />
</div>
