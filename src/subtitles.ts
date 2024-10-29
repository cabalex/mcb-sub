const subtitles: Season[] = [
    {
        title: 'Metal Cardbot',
        subtitle: 'Season 1',
        icon: './season1.png',
        language: 'en',
        incomplete: true,
        episodes: [
            {name: 'Mystery of the Police Car Robot!', id: 'ZLcqsmPCHLY', source: 'dub'},
            {name: 'The Dancing Dump Truck', id: '3ElOpqFXaSU', source: 'dub'},
            {name: 'Farewell, Blue Cop', id: '5RCpJwrhkrs', source: 'dub'},
            {name: 'The Black Ambulance', id: '52W_cb1f1ao', source: 'dub'},
            {name: 'Fire Truck With a Phobia', id: 'c_CdqDAyGqI', source: 'dub'},
            {name: 'The Invisible Challenger', id: 'YGHc9jfOsb0', source: 'dub'},
            {name: 'Defeating the Heli-Tornado', id: 'ksRW6iMADzQ', source: 'dub'},
            {name: 'The Secret is Out!', id: 'jzz3UOpvuV0', source: 'dub'},
            /*{name: '0 Seconds to Destruction', id: 'rkhiv9q4FJw', source: 'dub'},
            {name: 'Attack of the Final Boss!', id: '1lqFbWgblmk', source: 'dub'},
            {name: 'The Mysterious Transfer Student', id: 'sfh5bi5Njtc', source: 'dub'},
            {name: 'Blue Cop\'s Special Training!', id: 'aU5wLVRQIWQ', source: 'dub'},
            {name: 'Guardian of the Forest', id: 'PkNgHFctIIg', source: 'dub'},
            {name: 'Operation Underground Battle', id: '5igwoiB4sAE', source: 'dub'},
            {name: 'A Metal Cardbot from the Sky!', id: '8wpIPp7c094', source: 'dub'},
            {name: 'The Vagabond in the Sky', id: '4kAhVJnzL9w', source: 'dub'},
            {name: 'Showdown Between Blue Cop and Wild Guardy!', id: 't5_mM9bdq00', source: 'dub'},
            {name: 'The Great Showdown! Giant VS Giant!', id: 'ScF3TTBBfyo', source: 'dub'},
            */
        ]
    },
    {
        title: 'Metal Cardbot S',
        subtitle: 'Season 2',
        icon: './season2.jpg',
        language: 'en',
        incomplete: true,
        episodes: [
            
        ]
    }
]

export interface Season {
    title: string;
    subtitle: string;
    icon: string;
    language: string;
    incomplete: boolean;
    episodes: Episode[];
}

export interface Episode {
    name: string;
    id: string;
    source: 'dub' | 'sub' | 'translated';
}

export default subtitles;