import type { Episode, Source } from './subtitles';
import { decodeString } from './Playlist/steganography';

export interface CustomDraft {
	version: number;
	title: string;
	subtitle: string;
	icon: string;
	incomplete: boolean;
	source: Source;
	episodes: CustomEpisode[];
}

export interface CustomEpisode extends Omit<Episode, 'context'> {
	timings: Array<[number, number, string]>;
}

export function getCustomSubs() {
	const str = localStorage.getItem('mcb-customSubs');
	if (!str) return [];
	try {
		return JSON.parse(str) as CustomDraft[];
	} catch (e) {
		return [];
	}
}

export function saveCustomSub(customSub: CustomDraft) {
	const customSubs = getCustomSubs();
	const index = customSubs.findIndex((sub) => sub.source.path === customSub.source.path);
	if (index > -1) {
		customSubs[index] = customSub;
	} else {
		customSubs.push(customSub);
	}
	localStorage.setItem('mcb-customSubs', JSON.stringify(customSubs));
}

export function deleteCustomSub(customSub: CustomDraft) {
	const customSubs = getCustomSubs();
	const index = customSubs.findIndex((sub) => sub.source.path === customSub.source.path);
	if (index > -1) {
		customSubs.splice(index, 1);
	}
	localStorage.setItem('mcb-customSubs', JSON.stringify(customSubs));
}

export async function importFromFile(file: File) {
	const text = await decodeString(file);
	/*const buffer = new Uint8Array(await file.arrayBuffer());
	const metadata = readMetadata(buffer);
	console.log(metadata);
	if (metadata.tEXt && 'subtitle' in metadata.tEXt) {
		// btoa(unescape(encodeURIComponent(JSON.stringify($editor))));
		const text = atob(metadata.tEXt['subtitle'] as string);
		const length = text.length;
		const bytes = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			bytes[i] = text.charCodeAt(i);
		}
		const decoder = new TextDecoder(); // default is utf-8
		return JSON.parse(decoder.decode(bytes)) as CustomDraft;
	}*/
	if (text) {
		return JSON.parse(text) as CustomDraft;
	}
	return null;
}
