Generative avatars
Sometimes it is useful to generate beautiful fallback avatars for users that don't have a profile picture.

I use this component in Public bookmarks as a fallback avatar for bookmarks for URL-s that don't have a favicon. It will hash the given string and generate a unique gradient:

<Avatar.Fallback>Rauno Freiberg</Avatar.Fallback>
You can mess with the colors array used to generate the gradient for more customization:

const colors = ["#F6C750", "#E63525", "#050D4C", "#D4EBEE", "#74B06F"];
You can get the full source from the 
 action.