/* global _wpmejsSettings, MediaElementPlayer, jetpackPodcastPlayers */
/**
 * Internal dependencies
 */
import './style.scss';

const playerInstances = {};
const meJsSettings = typeof _wpmejsSettings !== undefined ? _wpmejsSettings : {};

const initializeBlock = function( id ) {
	const block = document.getElementById( id );

	// Check if we can find the block and required dependency.
	if ( ! block || ! MediaElementPlayer ) {
		return;
	}

	// Create player instance.
	const player = {
		id,
		block,
		currentTrack: 0,
	};

	// Initialize player UI.
	player.audio = document.createElement( 'audio' );
	player.audio.src = block
		.querySelector( '[data-jetpack-podcast-audio]' )
		.getAttribute( 'data-jetpack-podcast-audio' );
	block.insertBefore( player.audio, block.firstChild );
	player.mediaElement = new MediaElementPlayer( player.audio, meJsSettings );

	// Save instance to the list of active ones.
	playerInstances[ id ] = player;
};

// Initialze queued players.
if ( window.jetpackPodcastPlayers !== undefined ) {
	jetpackPodcastPlayers.forEach( initializeBlock );
}

// Replace the queue with an immediate initialization for async loaded players.
window.jetpackPodcastPlayers = {
	push: initializeBlock,
};

const episodeEls = document.querySelectorAll( '[data-jetpack-podcast-audio]' );
let activeEpisodeEl;

for ( let i = 0; i < episodeEls.length; i++ ) {
	episodeEls[ i ].addEventListener( 'click', function( e ) {
		e.preventDefault();
		// Prevent handling clicks if a modifier is in use.
		if ( e.shiftKey || e.metaKey || e.altKey ) {
			return;
		}

		// Check if the clicked element was episode link.
		const audioUrl = e.currentTarget.getAttribute( 'data-jetpack-podcast-audio' );
		if ( ! audioUrl ) {
			// ToDo: render error message from template
			return;
		}

		const blockEl = e.currentTarget.closest( '.wp-block-jetpack-podcast-player' );
		if ( ! blockEl ) {
			// ToDo: render error message from template
			return;
		}

		const player = playerInstances[ blockEl.id ];
		if ( ! player ) {
			// ToDo: render error message from template
			return;
		}

		player.audio.pause();
		blockEl.classList.remove( 'is-playing' );
		// ToDo: handle is-paused state
		if ( activeEpisodeEl ) {
			activeEpisodeEl.classList.remove( 'is-active' );
		}
		activeEpisodeEl = e.currentTarget.closest( '.podcast-player__episode' );

		player.audio.src = audioUrl;
		player.audio.play();
		blockEl.classList.add( 'is-playing' );
		activeEpisodeEl.classList.add( 'is-active' );

		e.preventDefault();
	} );
}
