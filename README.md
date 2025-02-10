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