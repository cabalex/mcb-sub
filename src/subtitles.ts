const subtitles: Season[] = [
    {
        title: 'Metal Cardbot',
        subtitle: 'Season 1',
        icon: './season1.png',
        incomplete: true,
        sources: [
            {name: 'Dub', language: 'en', path: '/dub', credits: 'SAMG Entertainment'},
        ],
        openings: [
            {name: 'Opening', id: '1070bnqHcHY'},
        ],
        episodes: [
            {name: 'Mystery of the Police Car Robot!', id: 'ZLcqsmPCHLY'},
            {name: 'The Dancing Dump Truck', id: '3ElOpqFXaSU'},
            {name: 'Farewell, Blue Cop', id: '5RCpJwrhkrs'},
            {name: 'The Black Ambulance', id: '52W_cb1f1ao'},
            {name: 'Fire Truck With a Phobia', id: 'c_CdqDAyGqI'},
            {name: 'The Invisible Challenger', id: 'YGHc9jfOsb0'},
            {name: 'Defeating the Heli-Tornado', id: 'ksRW6iMADzQ'},
            {name: 'The Secret is Out!', id: 'jzz3UOpvuV0'},
            {name: '0 Seconds to Destruction', id: 'rkhiv9q4FJw'},
            {name: 'Attack of the Final Boss!', id: '1lqFbWgblmk'},
            {name: 'The Mysterious Transfer Student', id: 'sfh5bi5Njtc'},
            {name: 'Blue Cop\'s Special Training!', id: 'aU5wLVRQIWQ'},
            {name: 'Guardian of the Forest', id: 'PkNgHFctIIg'},
            {name: 'Operation Underground Battle', id: '5igwoiB4sAE'},
            {name: 'A Metal Cardbot from the Sky!', id: '8wpIPp7c094'},
            {name: 'The Vagabond in the Sky', id: '4kAhVJnzL9w'},
            {name: 'Showdown Between Blue Cop and Wild Guardy!', id: 't5_mM9bdq00'},
            /*{name: 'The Hungry Metal Cardbot', id: 'hOeQeLZ4ccg'},
            {name: 'Metal Breath Gets Stolen', id: 'jk6TC3f6Uls'},
            {name: 'Anna\'s Metal Breath', id: 'QmVE7ZhwIv4'},
            {name: 'Goodbye, Buffalo Crush', id: 'FGG_QsPm5k8'},
            */
        ]
    },
    {
        title: 'Metal Cardbot S',
        subtitle: 'Season 2',
        icon: './season2.jpg',
        incomplete: true,
        sources: [
            {name: 'Translated', path: '/', language: 'en', credits: 'SAMG Entertainment'},
        ],
        openings: [],
        episodes: [
            
        ]
    }
].map(season => {
    season.openings = season.openings.map(episode => {
        // @ts-ignore
        episode.context = season;
        return episode;
    });
    season.episodes = season.episodes.map(episode => {
        // @ts-ignore
        episode.context = season;
        return episode;
    });
    return season;
})

export interface Season {
    title: string;
    subtitle: string;
    icon: string;
    incomplete: boolean;
    sources: Source[];
    openings: Episode[];
    episodes: Episode[];
}

export interface Source {
    name: string;
    path: string;
    language: string;
    credits?: string;
}

export interface Episode {
    name: string;
    id: string;
    context: Season;
}

export default subtitles;