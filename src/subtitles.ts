const subtitles: Season[] = [
	{
		title: 'Metal Cardbot',
		subtitle: 'Season 1',
		icon: './season1.png',
		sources: [
			{
				name: 'Dub',
				language: 'en',
				path: '/dub',
				credits: [
					{
						name: 'Central Entertainment',
						link: 'https://www.mewatch.sg/show/Metal-Cardbot-(Dual-Sound)-486086'
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
				name: '日本語',
				path: '/jp',
				language: 'jp',
				credits: [
					{ name: 'Soiya', link: 'https://twitter.com/913son3' },
					{ name: '매지컬비둘기/MP', link: 'https://twitter.com/MagicPigeon4' }
				],
				episodes: [
					{ name: 'OP', id: '1070bnqHcHY', label: 'OP' },
					{ name: '登場! パトカーロボット!?', id: 'ZLcqsmPCHLY', label: '1話' },
					{ name: '踊るダンプトラック', id: '3ElOpqFXaSU', label: '2話' },
					{ name: 'ブルーコップとの別れ', id: '5RCpJwrhkrs', label: '3話' },
					{ name: '黒い救急車', id: '52W_cb1f1ao', label: '4話' },
					{ name: '怖がりな消防車', id: 'c_CdqDAyGqI', label: '5話' },
					{ name: '見えない挑戦者', id: 'YGHc9jfOsb0', label: '6話' },
					{ name: 'ヘリトルネードをやっつけろ!', id: 'ksRW6iMADzQ', label: '7話' },
					{ name: 'バレた!メタルカードボットの秘密', id: 'jzz3UOpvuV0', label: '8話' },
					{ name: 'モータウン崩壊0秒前', id: 'rkhiv9q4FJw', label: '9話' },
					{ name: 'ラスボスの襲来!', id: '1lqFbWgblmk', label: '10話' },
					{ name: '謎の転校生', id: 'sfh5bi5Njtc', label: '11話' },
					{ name: 'ブルーコップ、特訓強行！', id: 'aU5wLVRQIWQ', label: '12話' },
					{ name: '森の守り神', id: 'PkNgHFctIIg', label: '13話' },
					{ name: '地下掃討(そうとう)作戦', id: '5igwoiB4sAE', label: '14話' },
					{ name: '空の彼方からやって来たメタルカードボット！', id: '8wpIPp7c094', label: '15話' },
					{ name: '空をさまよう流浪客(るろうかく)', id: '4kAhVJnzL9w', label: '16話' },
					{ name: 'ブルーコップとワイルドガーディの対決!', id: 't5_mM9bdq00', label: '17話' },
					{ name: '大激突!ジャイアントvsジャイアント!!', id: 'ScF3TTBBfyo', label: '18話' },
					{ name: '腹ペコ メタルカードボット', id: 'hOeQeLZ4ccg', label: '19話' },
					{ name: '盗まれた、メタルブレス', id: 'jk6TC3f6Uls', label: '20話' },
					{ name: 'アンナのメタルブレス', id: 'QmVE7ZhwIv4', label: '21話' },
					{ name: 'グッバイ バッファロークラッシュ!', id: 'FGG_QsPm5k8', label: '22話' },
					{ name: '裏切り者 バスターギャロン', id: 'B8IYxvIrf9o', label: '23話' },
					{ name: 'ブラックフックの逆襲', id: 'UCixUDwUZtA', label: '24話' },
					{ name: 'へビーバトル', id: '798fkUeeMOU', label: '25話' },
					{ name: '最後の決戦', id: 'L0WnJ7Kz_rw', label: '26話', fx: true }
				]
			},
			{
				name: 'Português',
				language: 'pt-br',
				path: '/pt-br_s1',
				credits: [
					{
						name: 'Metal Cardbots Brasil',
						link: 'https://www.youtube.com/@metal.cardbotsbrasil'
					}
				],
				episodes: [
					{ name: 'Abertura', id: '1070bnqHcHY', label: 'OP' },
					{ name: 'O Mistério da Viatura Robô!', id: 'ZLcqsmPCHLY' },
					{ name: 'O Caminhão Dançarino', id: '3ElOpqFXaSU' },
					{ name: 'Adeus, Blue Cop', id: '5RCpJwrhkrs' },
					{ name: 'A Ambulância Sombria', id: '52W_cb1f1ao' },
					{ name: 'O Caminhão de Bombeiros com Medo de Fogo', id: 'c_CdqDAyGqI' },
					{ name: 'O Desafiante Invisível', id: 'YGHc9jfOsb0' },
					{ name: 'Derrotando o Heli-Tornado', id: 'ksRW6iMADzQ' },
					{ name: 'O Segredo Foi Revelado!', id: 'jzz3UOpvuV0' },
					{ name: '0 Segundos Até o Impacto', id: 'rkhiv9q4FJw' },
					{ name: 'O Ataque do Chefão Final!', id: '1lqFbWgblmk' },
					{ name: 'O Misterioso Aluno Transferido', id: 'sfh5bi5Njtc' },
					{ name: "O Treinamento Especial do Blue Cop!", id: 'aU5wLVRQIWQ' },
					{ name: 'O Guardião da Floresta', id: 'PkNgHFctIIg' },
					{ name: 'Operação: Batalha Subterrânea', id: '5igwoiB4sAE' },
					{ name: 'Um Metal Cardbot Alado!', id: '8wpIPp7c094' },
					{ name: 'O Andarilho dos Céus', id: '4kAhVJnzL9w' },
					{ name: 'O Duelo entre Blue Cop e Wild Guardy!', id: 't5_mM9bdq00' },
					{ name: 'O Grande Confronto! Gigante vs Gigante!', id: 'ScF3TTBBfyo' },
					{ name: 'O Metal Cardbot Faminto', id: 'hOeQeLZ4ccg' },
					{ name: 'O Metal Breath é Roubado', id: 'jk6TC3f6Uls' },
					{ name: "O Metal Breath da Anna", id: 'QmVE7ZhwIv4' },
					{ name: 'Adeus, Buffalo Crush!', id: 'FGG_QsPm5k8' },
					{ name: 'Buster Gallon, o Traidor', id: 'B8IYxvIrf9o' },
					{ name: 'O Contra-Ataque de Black Hook', id: 'UCixUDwUZtA' },
					{ name: 'A Ferro e Fogo', id: '798fkUeeMOU' },
					{ name: 'A Batalha Final', id: 'L0WnJ7Kz_rw', fx: true }
				]
			}
		]
	},
	{
		title: 'Metal Cardbot S',
		subtitle: 'Season 2',
		icon: './season2.jpg',
		sources: [
			{
				name: 'Fansub',
				path: '/fansub',
				language: 'en',
				credits: [
					{ name: '@staro_sphere', link: 'https://x.com/staro_sphere' },
					{ name: '@PalmtreePanic', link: 'https://x.com/PalmtreePanic' }
				],
				episodes: [
					{ name: 'Opening', id: 'w3QOebaRTSI', label: 'OP' },
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
					{ name: 'The Greatest Power Awakens!', id: 'sy7IirZENS8', fx: true },
					{ name: "Red Blitz's Sincerity", id: '2ix1fypVifg', fx: true },
					{ name: "Can't Stop!", id: 'pw70mJ0vwZU' },
					{ name: 'Catch Me! Outlaw of the Sea!', id: 'Ini9Ziuhz_M' },
					{ name: 'Help Me, Deep Bite!', id: 'ZdEtjdIbBh4' },
					{ name: 'Pure White Wings, Sky Gallop', id: '2nPc20St3us' },
					{ name: 'Midnight Ghost Train', id: 'r2W9OkNQjIQ', fx: true },
					{ name: 'Runaway Locomotive Blastrain', id: 'ERhxa8LiPmw' },
					{ name: 'Exclusive! Steel Interview', id: 'AC1GDGiJ3hA' },
					{ name: 'Fair and Square! Vector and Bit Brothers', id: 'nr8xAuarerk' },
					{ name: 'The True Master of the Metal Breath', id: 'wbj59CLjZuA' },
					{ name: "Glober's Last Stand", id: 'xJbp4uef1ro' },
					{ name: 'A Gift From Mukara', id: 'cvzhjJ7RJgE', fx: true },
					{ name: 'The Revival of Flame Nova', id: 'BEjuMKd_Cew' },
					{ name: 'Search for the Speranza', id: 'arhU41qy4ic' },
					{ name: 'Battle of the Red Ark', id: '8nGDlfiNOG8', fx: true },
					{ name: 'Return of Steel', id: 'ACqsVI_TFl4', fx: true }
				]
			},
			{
				name: '日本語',
				path: '/jp',
				language: 'jp',
				credits: [
					{ name: 'Soiya', link: 'https://twitter.com/913son3' },
					{ name: '매지컬비둘기/MP', link: 'https://twitter.com/MagicPigeon4' }
				],
				episodes: [
					{ name: 'OP', id: 'w3QOebaRTSI', label: 'OP' },
					{
						name: '石板から目覚めたメタルカードボット',
						id: '3P-D6WLA424',
						label: '1話'
					},
					{ name: '2つ目のメタルカードボット!', id: 'kwxZy0fOmG4', label: '2話' },
					{ name: '空の上の脅威', id: 'KmHp3PSBHXM', label: '3話' },
					{ name: 'シエロはご機嫌ななめ!', id: 'outtz10cTjY', label: '4話' },
					{ name: 'スクープ！鋼鉄の取材記者', id: 'hvcwuisAcWw', label: '5話' },
					{ name: 'マッスルハイドの選択', id: 'Y6ORwgjJcIw', label: '6話' },
					{ name: '洞窟大脱出', id: 'OeCr53P6z6c', label: '7話' },
					{ name: '大丈夫だよ、ロッククラッシュ！', id: 'TyGBkSwejk4', label: '8話' },
					{ name: 'ギガントレックスとの再会', id: 'Rw06vJ8OJIg', label: '9話' },
					{ name: '目覚めた最強の力', id: 'sy7IirZENS8', label: '10話', fx: true },
					{ name: 'レッドブリッツの本心', id: '2ix1fypVifg', label: '11話', fx: true },
					{ name: '止められない!', id: 'pw70mJ0vwZU', label: '12話' },
					{ name: '釣りあげろ!海の無法者!', id: 'Ini9Ziuhz_M', label: '13話' },
					{ name: '助けて、ディープバイト!', id: 'ZdEtjdIbBh4', label: '14話' },
					{ name: '純白の翼、スカイギャロップ', id: '2nPc20St3us', label: '15話' },
					{ name: '真夜中の幽霊列車', id: 'r2W9OkNQjIQ', fx: true, label: '16話' },
					{ name: '暴走機関車、ブラストレイン', id: 'ERhxa8LiPmw', label: '17話' },
					{ name: '独占！鋼鉄のインタビュー', id: 'AC1GDGiJ3hA', label: '18話' },
					{ name: '正々堂々！ベクトルとビット兄弟！', id: 'nr8xAuarerk', label: '19話' },
					{ name: 'メタルブレスの真の主', id: 'wbj59CLjZuA', label: '20話' },
					{ name: 'グローバーの最期', id: 'xJbp4uef1ro', label: '21話' },
					{ name: 'ムカラの贈り物', id: 'cvzhjJ7RJgE', label: '22話', fx: true },
					{ name: 'フレイムノヴァの復活', id: 'BEjuMKd_Cew', label: '23話' },
					{ name: 'スペランサ号を探して', id: 'arhU41qy4ic', label: '24話' },
					{ name: '赤い箱舟の戦闘', id: '8nGDlfiNOG8', label: '25話', fx: true },
					{ name: '鋼鉄の帰還', id: 'ACqsVI_TFl4', label: '26話', fx: true }
				]
			}
		]
	},
	{
		title: 'Metal Cardbot W',
		subtitle: 'Season 3',
		icon: './season3.jpg',
		sources: [
			{
				name: 'Fansub',
				path: '/fansub',
				language: 'en',
				credits: [
					{ name: '@staro_sphere', link: 'https://x.com/staro_sphere' },
					{ name: '@PalmtreePanic', link: 'https://x.com/PalmtreePanic' }
				],
				episodes: [
					{ name: 'Teaser', id: '4J3vusCIhhc', label: 'Teaser' },
					{ name: 'Opening', id: 'wuMN8mCNLdk', label: 'OP' },
					{ name: 'Era of Change', id: 'igqcOBDjKYE', intro: 71 },
					{ name: "Wild Cardbot's Roar", id: '91ZQRAqYUj4', intro: 71 }
				]
			},
			{
				name: '日本語',
				path: '/jp',
				language: 'jp',
				credits: [
					{ name: 'Soiya', link: 'https://twitter.com/913son3' },
					{ name: '매지컬비둘기/MP', link: 'https://twitter.com/MagicPigeon4' }
				],
				episodes: [
					{ name: 'ティーザー', id: '4J3vusCIhhc', label: 'ティーザー' },
					{ name: 'OP', id: 'wuMN8mCNLdk', label: 'OP' },
					{ name: '変化の時代', id: 'igqcOBDjKYE', label: '1話', intro: 71 },
					{ name: 'ワイルドカードボットの咆哮', id: '91ZQRAqYUj4', label: '2話', intro: 71 }
				]
			}
		]
	}
].map((season) => {
	season.sources.map((source) => {
		let i = 0;
		source.title = season.title;
		source.subtitle = season.subtitle;
		source.episodes = source.episodes.map((episode) => {
			// @ts-ignore
			if (!episode.label) {
				i++;
				episode.label = `Episode ${i}`;
			}
			episode.context = season;
			return episode;
		});
		return source;
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
	'/jp': {
		ZLcqsmPCHLY: `
		<div class="notice">
		<h2>🔊 英語が聞こえますか?</h2>
		<p><b>SAMGはこのエピソードに英語吹き替えを追加しました。動画を再生すると自動的に選択されます。</b> これをオフにする方法はなく、このウェブサイトでは再生される音声トラックを制御できません。<b>設定 > 音声トラック > 韓国語（オリジナル）</b> をクリックして手動で変更する必要があります。<br />ご不便をおかけして申し訳ございません :(</p>
		</div>
		`
	},
	'/fansub': {
		KmHp3PSBHXM: `<p>At the flashback beginning at <span class="timestamp">3:09</span>, Black Hook insults Heavy Iron, causing them to fight. The literal translation is along the lines of "What did you say, you shooting-star-sized eyes?!" (meaning "small eyes"), which doesn't make much sense in English. We changed it to "Does this weird-eyed guy have something to say about me?".</p>
            <h2>About the genders of Cardbots</h2>
            <p>Throughout Season 2, <b>we use they/them to refer to Cardbots with feminine appearances</b>, such as Cielo. We do this because <b style="color: orange">we have no confirmation as to what gender feminine Cardbots take on in Metal Cardbot S, if Cardbots have gender at all</b>.</p>
			<p>Production staff working on the show have disagreed as to whether there are female Cardbots in Metal Cardbot S. One of the toy designers infamously said that <a href="https://x.com/blue_audax/status/1821548930016170271" target="_blank">"there are no female robots in Season 2"</a>, while members of the directing team have often anthropomorphized these Cardbots as female in their own fan works (but this should not be taken as canonical information). Still other staff members have said that <a href="https://x.com/staffwhy/status/2007530113576136886" target="_blank">Cardbots have no gender</a>, since they have no concept of birth or birthdays. As Korean pronouns are usually gender-neutral, there is no definitive answer given in the show itself.</p>
            <p>While there is a discussion to be had about how gender is portrayed in the mecha genre as a whole, we'll be using <b>they/them</b> to maintain a neutral stance in the discussion while we await more information. We know this may not be the answer you're looking for, and you are welcome to interpret it how you like - but <b>please do not harass anyone (<i>especially</i> production staff) for having different interpretations</b>.</p>
			<p>If this information changes, we'll be sure to let you know!</p>`,
		Y6ORwgjJcIw: `<p>Throughout the episode, the phrase "수단과 방법을 가려서은 안 된다" (<i>sudangwa bangbeob-eul galyeoseoeun an doenda</i>) is used by Red Blitz, Musclehyde, and Jun to mean "You must not be picky about the means and methods".</p>
            <p>In this fansub, we have translated it as "By any means necessary", but @staro_sphere also suggested "We must leave no stone unturned" as an alternative.</p>`,
		Ini9Ziuhz_M: `<p>Jun eventually suggests the operation "거대상어 외주일 낚시!" (<i>geodaesang-eo oeju-il nakksi</i>), which @staro_sphere more directly translated as "Giant Shark Outrigger Fishing". We changed this to "Hook, Line, and Sinker!" to maintain the spirit of the original line while making it more understandable for general audiences.</p>
			<p>And yes, Musclehyde's Crane "Bhuh" is the official translation of his Weapon Card (크레인 부지), as seen in his <a href="https://youtu.be/zTbADlD9ftA?t=205" target="_blank">introduction video</a>. It would make more sense for it to be Crane Site (as 부지 directly means "construction site"), but maybe they translated it this way because bhuh might mean ground in Hindi or something? We're not sure. Maybe it's a pun!</p>
			<p>...also, @PalmtreePanic may have made Red Blitz's cursing fish related. 🦐</p>`,
		wbj59CLjZuA: `<p><span class="timestamp">2:51</span> - Blue Cop's line means something along the lines of "Glober makes you so charmed/entranced that you let him go off and take control of the conversation". We found "caught up by his words" to be the best way to convey this, but it's still not great.</p>
			<p><span class="timestamp">4:56</span> - This line is a general joke/pun making fun of Red Blitz's Crimson Kick. @staro_sphere suggested "red roly poly kick", but it's probably closer to a more silly version of "storm kick". There is probably a more accurate translation of this line possible, but... 🦐</p>`,
		wuMN8mCNLdk: `<p>Welcome to Metal Cardbot W!</p>
			<p>New this season is that we wanted to make sure the opening is <i>actually singable</i> in English. This involves a lot of lyrical compromises to keep the same rhythm and syllable count while retaining the original meaning. Nevertheless, we hope you enjoy it!</p>
			<p>One of the lyrics we wanted to keep is <span class="timestamp">0:44</span>, "우주의 별처럼" ("like the stars across the universe"), but we couldn't make "universe" work in this context. It may not be as cool, but "like all the stars in the sky!" is fun to sing, we think.</p>
			<p>Metal Cardbot W premieres this December 4th on EBS, but due to copyright restrictions, we will not be able to provide subtitles until the episodes begin uploading to YouTube (usually this happens around 4 months after the first episode is broadcasted). Check back later!</p>`
	}
};

export interface Season {
	title: string;
	subtitle: string;
	icon: string;
	sources: Source[];
}

export interface Source {
	name: string;
	title: string;
	path: string;
	language: string;
	episodes: Episode[];
	incomplete: boolean;
	credits: { name: string; link: string }[];
}

export interface Episode {
	name: string;
	id: string;
	label: string;
	fx?: boolean;
	intro?: number;
	context: Season;
}

export default subtitles;
