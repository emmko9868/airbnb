# typo

Font files: `.woff2` (best), `.woff`, `.ttf` or `.otf`.

Save them straight into `my-assets/` and run `pnpm assets` — it moves fonts here and names each file **Family-Weight**. It reads the real font name from inside the file, so a download called `font (1).ttf` still gets the right name. If your Figma text styles use the same font, it uses Figma's spelling.

| File name | Means |
|---|---|
| `Pretendard-Regular.woff2` | Pretendard, weight 400 |
| `Pretendard-Bold.woff2` | Pretendard, weight 700 |
| `Inter-MediumItalic.ttf` | Inter, weight 500, italic |
| `Noto_Sans_KR-Bold.ttf` | Noto Sans KR, weight 700 (`_` stands for a space) |
| `Noto_Sans_KR-Variable.ttf` | Noto Sans KR, all weights in one file (variable font) |

Weights: Thin 100 · ExtraLight 200 · Light 300 · Regular 400 · Medium 500 · SemiBold 600 · Bold 700 · ExtraBold 800 · Black 900

- Fonts load automatically in Storybook and on your website. See **Foundation → Typography**.
- Parts and pages use one font token, `--font-sans`. To switch it to your font, make a text plan — Foundation → Typography shows the steps, or type `/my-assets` in Qwen Code.
- **License:** every font file here goes online with your website and Storybook, even if no page uses it, and anyone who knows the address can download it. Keep only fonts whose license allows use on websites — check the license notes from where you got the font. If you aren't sure, leave the font out.
