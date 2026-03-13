# [Metal Cardbot SUB](https://cabalex.github.io/mcb-sub)
A small web app that adds subtitles to METAL CARDBOT. Simply overlays English fan-subs on-top of the preexisting METALCARDBOTTV YouTube videos.

## Disclaimer
Metal Cardbot is owned by SAMG/NAVY, and this app is not affiliated with them in any way. It's simply a way for overseas fans to watch the series!

## How do Sub Cards work?
Sub Cards are a brand new feature that allows anyone to make and share subtitles on the Metal Cardbot SUB website. They're portable, modifiable, and fun!

Sub Cards use Least Significant Bit steganography and ZStandard compression to store data in your Card. If you peek closely at your Card, you may even be able to see it!

Since it's stored in the image data itself, you can upload them to social media platforms without any issues. But due to the delicacy of such encoding, **editing the Card in an external program will likely break it**, so you probably shouldn't do that. You wouldn't scribble all over a Cardbot's face, would you?

Please note that sometimes Card decompression can fail. If a Card is failing to import when it shouldn't, I recommend reloading the page.

For nerds, you can edit a draft subtitle programmatically using `getEditor()` and `setEditor()`, exposed in the console.

# Contributing new subs
Want to have your own fan subtitles show up on the sub site? Thanks for your interest! To appear on the sub site:

- You need at least **half of a season (13 episodes) subtitled upon submission.** Obviously, the more, the better.
- You or another subber **must have some proficiency in Korean (strongly recommended), or English**. You should not have to purely rely on Google Translate or AI models to create your sub.
  - If you do not have Korean proficiency, please base your subtitles off the English fan subtitles found on the sub site. **Do not rely on the English dub.**

We want to ensure those watching the show for the first time are receiving the best experience possible, so please ensure your subtitles are accurate and reliable!

If your subs meet these criteria, feel free to [contact the site owner through social media](https://cabalex.github.io) or open a Pull Request.

If they don't meet the criteria, don't worry! You can still make your subs and share them with the world using Sub Cards.

## New Subs FAQ

### Can I sub an episode or video that isn't on the sub site?
Unfortunately, this isn't supported at this time. Due to copyright restrictions, we also cannot allow fan reuploads of newer episodes to be published on the site.

### What if I want to update my subtitles later?
Please send a message or pull request when you do, but please *do not send more than one update per 2 weeks.* A speedy response is not guaranteed!
