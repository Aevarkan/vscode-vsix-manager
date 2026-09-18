import process from 'process';
import type { GitHub, GitHubReleasesInfo } from '../types.js';
import { Logger } from '../utils/logger.js';

export function getReleasesUrl(extensionName: string, source: GitHub | undefined): string { // {{{
	const serviceUrl = source?.serviceUrl ?? 'https://api.github.com';
	if(source?.owner) {
		const url = `${serviceUrl}/repos/${source.owner}/${extensionName}/releases`;
		Logger.debug(`Resolved GitHub URL to ${url}`);
		return url;
	}
	else {
		const url = `${serviceUrl}/repos/${extensionName}/releases`;
		Logger.debug(`Resolved GitHub URL to ${url}`);
		return url;
	}
} // }}}

export function getAssetUrl(asset: unknown): string { // {{{
	return (asset as { url: string }).url;
} // }}}

export function getHeaders(source: GitHub | undefined): { headers: {} } | undefined { // {{{
	if(source?.token) {
		let token: string | undefined = '';

		if(source.token.startsWith('env:')) {
			token = process.env[source.token.slice(4)];
		}
		else {
			token = source.token;
		}

		if(token) {
			return {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};
		}
	}

	return undefined;
} // }}}

export function getDownloadHeaders(source: GitHub | undefined): { headers: {} } | undefined { // {{{
	return {
		headers: {
			Accept: 'application/octet-stream',
			...getHeaders(source)?.headers,
		},
	};
} // }}}

export function getFirstVsixUrl(releasesList: GitHubReleasesInfo): string | null {
	// The API already sorts by time. We just find the first VSIX file.

	let latestUrl: string | undefined;

	// TODO: This assumes the .vsix file is universal and does not factor in differing platform requirements.
	for(const release of releasesList) {
		// NOTE: This assumes the extension uses a .vsix file extension
		for(const asset of release.assets) {
			const { name, url } = asset;
			if(!(name.endsWith('.vsix'))) {
				continue;
			}

			latestUrl = url;
		}
	}

	if(latestUrl) {
		return latestUrl;
	}
	else {
		return null;
	}
}
