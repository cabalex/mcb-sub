const subtitles: Season[] = [
	{
		title: 'Metal Cardbot',
		subtitle: 'Season 1',
		icon: './season1.png',
		incomplete: false,
		sources: [
			{
				name: 'Dub',
				language: 'en',
				path: '/dub',
				credits: [
					{
						name: 'SAMG Entertainment',
						link: 'https://www.mewatch.sg/show/Metal-Cardbot-(Dual-Sound)-486086'
					}
				]
			}
		],
		episodes: [
			{ name: 'Opening', id: '1070bnqHcHY', label: 'OP' },
			{ name: 'Mystery of the Police Car Robot!', id: 'ZLcqsmPCHLY' },
			{ name: 'The Dancing Dump Truck', id: '3ElOpqFXaSU' },
			{ name: 'Farewell, Blue Cop', id: '5RCpJwrhkrs' },
			{ name: 'The Black Ambulance', id: '52W_cb1f1ao' },
			{ name: 'Fire Truck With a Phobia', id: 'c_CdqDAyGqI' },
			{ name: 'The Invisible Challenger', id: 'YGHc9jfOsb0' },
			{ name: 'Defeating the Heli-Tornado', id: 'ksRW6iMADzQ' },
			{ name: 'The Secret is Out!', id: 'jzz3UOpvuV0' },
			{ name: '0 Seconds to Destruction', id: 'rkhiv9q4FJw' },
			{ name: 'Attack of the Final Boss!', id: '1lqFbWgblmk' },
			{ name: 'The Mysterious Transfer Student', id: 'sfh5bi5Njtc' },
			{ name: "Blue Cop's Special Training!", id: 'aU5wLVRQIWQ' },
			{ name: 'Guardian of the Forest', id: 'PkNgHFctIIg' },
			{ name: 'Operation Underground Battle', id: '5igwoiB4sAE' },
			{ name: 'A Metal Cardbot from the Sky!', id: '8wpIPp7c094' },
			{ name: 'The Vagabond in the Sky', id: '4kAhVJnzL9w' },
			{ name: 'Showdown Between Blue Cop and Wild Guardy!', id: 't5_mM9bdq00' },
			{ name: 'The Great Showdown! Giant VS Giant!', id: 'ScF3TTBBfyo' },
			{ name: 'The Hungry Metal Cardbot', id: 'hOeQeLZ4ccg' },
			{ name: 'Metal Breath Gets Stolen', id: 'jk6TC3f6Uls' },
			{ name: "Anna's Metal Breath", id: 'QmVE7ZhwIv4' },
			{ name: 'Goodbye, Buffalo Crush', id: 'FGG_QsPm5k8' },
			{ name: 'Buster Gallon, the Betrayer', id: 'B8IYxvIrf9o' },
			{ name: 'Black Hook Strikes Back', id: 'UCixUDwUZtA' },
			{ name: 'Heavy Battle', id: '798fkUeeMOU' },
			{ name: 'The Final Battle', id: 'L0WnJ7Kz_rw', fx: true }
		]
	},
	{
		title: 'Metal Cardbot S',
		subtitle: 'Season 2',
		icon: './season2.jpg',
		incomplete: true,
		sources: [
			{
				name: 'Fansub',
				path: '/fansub',
				language: 'en',
				credits: [
					{ name: '@staro_sphere', link: 'https://x.com/staro_sphere' },
					{ name: '@PalmtreePanic', link: 'https://x.com/PalmtreePanic' }
				]
			}
		],
		episodes: [
			{
				name: 'Metal Cardbot Awakens from the Stone Tablet?!',
				id: '3P-D6WLA424'
			},
			{ name: 'The Second Metal Card!', id: 'kwxZy0fOmG4' },
			{ name: 'Menace Up in the Sky!', id: 'KmHp3PSBHXM' },
			{ name: 'Cielo is Upset!', id: 'outtz10cTjY' },
			{ name: 'Exclusive! Steel Reporter', id: 'hvcwuisAcWw' },
			{ name: "Musclehyde's Choice!", id: 'Y6ORwgjJcIw' },
			{ name: 'The Great Cave Escape!', id: 'OeCr53P6z6c' },
			{ name: "It's Okay, Rock Crush", id: 'TyGBkSwejk4' },
			{ name: 'Reunion with Gigantrex!', id: 'Rw06vJ8OJIg' },
			{ name: 'The Greatest Power Awakens!', id: 'sy7IirZENS8', fx: true }
		]
	}
].map((season) => {
	let i = 0;
	season.episodes = season.episodes.map((episode) => {
		// @ts-ignore
		if (!episode.label) {
			i++;
			episode.label = `Episode ${i}`;
		}
		episode.context = season;
		return episode;
	});
	return season;
}) as Season[];

export const translationNotes: { [key: string]: { [key: string]: string } } = {
	'/dub': {
		ZLcqsmPCHLY: `
		<div class="notice">
		<h2>🔊 Hearing English?</h2>
		<p><b>SAMG has added the English dub to this episode, which is automatically selected when you play the video.</b> There is no way to turn this off, and this website has no control over what audio track is played. You must manually change it by clicking <b>Settings > Audio Tracks > Korean original</b>.<br />I apologize for the inconvenience :(</p>
		</div>
		<p>Welcome to the Metal Cardbot unofficial fan sub website! Here you'll find all (freely) uploaded episodes of Metal Cardbot, translated into English. These are embedded directly from the metalcardbotTV YouTube channel, so there's no piracy involved!</p>
        <p><b>Metal Cardbot is property of SAMG/Navy, and I do not claim any right to anything streamed on this website</b> (with the exception of the fan subtitles, which were created by myself and other fans of the series). Please support the series and its creators!</p>`
	},
	'/fansub': {
		KmHp3PSBHXM: `<p>At the flashback beginning at 3:09, Black Hook insults Heavy Iron, causing them to fight. The literal translation is along the lines of "What did you say, you shooting-star-sized eyes?!" (meaning "small eyes"), which doesn't make much sense in English. We changed it to "Does this weird-eyed guy have something to say about me?".</p>
            <h2>About the genders of Cardbots</h2>
            <p>Throughout Season 2, we use they/it to refer to Cielo, since staff working on the show have said <a href="https://x.com/blue_audax/status/1821548930016170271" target="_blank">"there are no female robots in Season 2"</a>. Though Cielo has a female voice actor and Cardbots are inherently genderless, they often take on masculine appearances and pronouns; all Season 1 Cardbots are referred to as "he/it" in the English dub.</p>
            <p>While there is a discussion to be had about gender bias in the mecha genre as a whole, we'll be using these pronouns to stay true to the creators' intent.</p>`,
		Y6ORwgjJcIw: `<p>Throughout the episode, the phrase "수단과 방법을 가려서은 안 된다" (<i>sudangwa bangbeob-eul galyeoseoeun an doenda</i>) is used by Red Blitz, Musclehyde, and Jun to mean "You must not be picky about the means and methods".</p>
            <p>In this fansub, we have translated it as "By any means necessary", but @staro_sphere also suggested "We must leave no stone unturned" as an alternative.</p>`
	}
};

export interface Season {
	title: string;
	subtitle: string;
	icon: string;
	incomplete: boolean;
	sources: Source[];
	episodes: Episode[];
}

export interface Source {
	name: string;
	path: string;
	language: string;
	credits: { name: string; link: string }[];
}

export interface Episode {
	name: string;
	id: string;
	label: string;
	fx?: boolean;
	context: Season;
}

export default subtitles;
