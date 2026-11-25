# my-assets — your icons, pictures and fonts

**Drop any icon, picture or font file right here in `my-assets/`.** Then ask the AI in the Qwen chat:

```
Sort the files in my-assets.
```

The AI runs the kit's sorting command (an approval box appears: choose **Yes, allow once**). It sorts each file into the right folder, fixes the name and tells you what happened. If the AI does something else, say it again more clearly. Shortcut if that still fails: start your message with `/my-assets`.

| Folder | What ends up there | Names |
|---|---|---|
| [`icons/`](icons/) | Small SVG icons from Figma | `shopping-cart.svg` |
| [`images/`](images/) | Pictures: `.png` `.jpg` `.jpeg` `.webp` `.gif` `.avif`, and SVGs that are not icons | `hero-photo.png` |
| [`typo/`](typo/) | Fonts: `.woff2` `.woff` `.ttf` `.otf` | `Pretendard-Bold.woff2` |

How an SVG is sorted

- **Icon:** 64 or smaller, square, 1–2 colors, no gradients, effects or pictures inside.
- **Picture:** has a picture inside, or is bigger than 256, or is bigger than 64 and wide/tall, colorful (3+ colors) or uses gradients/effects.
- **Anything else stays here** and the AI asks you where it goes. Just answer in words, for example:

  ```
  logo.svg is an icon.
  ```

  The AI moves it for you (choose **Yes, allow once**).

Files it can't use (other formats, SVGs with code in them, two files with the same name) stay where they are and are listed as `✗` with how to fix them. It never deletes your files.

You'll see everything in Storybook: **Foundation → Icons**, **Foundation → Images** and **Foundation → Typography**.

Only you put files here. The AI reads this folder but is not allowed to change it — if an icon or picture is missing, it will ask you to export it.
