import { ZstdInit } from '@oneidentity/zstd-js';

export async function decode(img: Blob) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const image = new Image();
	image.src = URL.createObjectURL(img);
	await image.decode();
	if (!ctx) {
		throw new Error('Could not create canvas context');
	}
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0);
	const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
	const buffer2 = new Uint8Array(unweave(data.buffer));
	// find where buffer ends
	let end = buffer2.length;
	for (let i = buffer2.length - 1; i >= 0; i--) {
		if (buffer2[i] !== 0) {
			end = i + 1;
			break;
		}
	}
	return buffer2.slice(0, end).buffer;
}

/**
 * Weaves secret data into target buffer, using bitsPerByte pixels.
 * @returns The % space taken up in the image (0-1).
 */
function weave(target: ArrayBufferLike, secret: ArrayBufferLike, bitsPerByte = 4) {
	const targetUint8 = new Uint8Array(target);
	const secretUint8 = new Uint8Array(secret);

	let secretBitIndex = 0;
	let totalBytes = 0;
	let currentBit = secretUint8[0];
	for (let i = 0; i < targetUint8.length; i++) {
		if (targetUint8[Math.floor(i / 4) * 4 + 3] !== 255 || (i + 1) % 4 === 0) {
			continue;
			//continue;
		}
		if (secretBitIndex % 8 === 0) {
			currentBit = secretUint8[secretBitIndex / 8] || 0;
			totalBytes++;
		}
		targetUint8[i] =
			(targetUint8[i] & (0b11111111 << bitsPerByte)) | (currentBit >> (8 - bitsPerByte));
		currentBit = (currentBit << bitsPerByte) & 0b11111111;
		secretBitIndex += bitsPerByte;
	}
	if (secretBitIndex / 8 < secretUint8.length) {
		console.warn(`Not all secret data encoded (${secretBitIndex / 8} < ${secretUint8.length})`);
	}
	return secretUint8.byteLength / totalBytes;
}

/**
 * Retrieves secret data from target buffer.
 * @returns
 */
function unweave(target: ArrayBufferLike, bitsPerByte = 4) {
	const targetUint8 = new Uint8Array(target);
	const secretUint8 = new Uint8Array(Math.floor((targetUint8.length * bitsPerByte) / 8));

	let secretBitIndex = 0;
	let currentBit = 0;
	for (let i = 0; i < targetUint8.length; i++) {
		if (targetUint8[Math.floor(i / 4) * 4 + 3] !== 255 || (i + 1) % 4 === 0) {
			continue;
		}
		secretBitIndex += bitsPerByte;
		currentBit = (currentBit << bitsPerByte) | (targetUint8[i] & ((2 << (bitsPerByte - 1)) - 1));
		if (secretBitIndex % 8 === 0) {
			secretUint8[secretBitIndex / 8 - 1] = currentBit;
			currentBit = 0;
		}
	}
	return secretUint8.buffer;
}

export function encode(ctx: CanvasRenderingContext2D | ArrayBufferLike, data: ArrayBufferLike) {
	let dataLeft;
	if (ctx instanceof CanvasRenderingContext2D) {
		const img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		dataLeft = weave(img.data.buffer, data);
		ctx.putImageData(img, 0, 0);
	} else {
		dataLeft = weave(ctx, data);
	}
	return dataLeft;
}

const zstd = ZstdInit();

// ZSTD compression can fail sometimes with an out of memory error... so retry
async function compress(buffer: Uint8Array) {
	for (let i = 0; i < 5; i++) {
		try {
			const compressed = (await zstd).ZstdStream.compress(buffer);
			console.log('Compress success');
			return compressed;
		} catch (e) {
			console.error(e);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
	throw new Error('Failed to compress buffer');
}

async function decompress(buffer: Uint8Array) {
	for (let i = 0; i < 5; i++) {
		try {
			const decompressed = (await zstd).ZstdStream.decompress(buffer);
			console.log('Decompress success');
			return decompressed;
		} catch (e) {
			console.error(e);
		}
	}
	console.error(buffer);
	throw new Error('Failed to decompress buffer');
}

export async function encodeString(ctx: CanvasRenderingContext2D | ArrayBufferLike, str: string) {
	const encoder = new TextEncoder();
	const strBuffer = encoder.encode(str);
	const compressed = await compress(strBuffer);
	return encode(ctx, compressed.buffer);
}

export async function decodeString(img: Blob) {
	const buffer = await decode(img);
	console.log('Got buffer of length', buffer.byteLength);
	const decompressed = await decompress(new Uint8Array(buffer));
	return new TextDecoder().decode(decompressed);
}
