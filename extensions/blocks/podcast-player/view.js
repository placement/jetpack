/* global _wpmejsSettings, MediaElementPlayer, jetpackPodcastPlayers */
/**
 * Internal dependencies
 */
import './style.scss';

const playerInstances = {};
const meJsSettings = typeof _wpmejsSettings !== undefined ? _wpmejsSettings : {};

function initializeBlock( id ) {
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

	player.mediaElement.media.addEventListener( 'play', handleMediaPlay );
	player.mediaElement.media.addEventListener( 'pause', handleMediaPause );

	// Save instance to the list of active ones.
	playerInstances[ id ] = player;
}

// Initialze queued players.
if ( window.jetpackPodcastPlayers !== undefined ) {
	jetpackPodcastPlayers.forEach( initializeBlock );
}

// Replace the queue with an immediate initialization for async loaded players.
window.jetpackPodcastPlayers = {
	push: initializeBlock,
};

function handleMediaPlay( e ) {
	const audioEl = e.detail.target;
	const parentBlockEl = audioEl.closest( '.wp-block-jetpack-podcast-player' );

	parentBlockEl.classList.remove( 'is-paused' );
	parentBlockEl.classList.add( 'is-playing' );
}

function handleMediaPause( e ) {
	const audioEl = e.detail.target;
	const parentBlockEl = audioEl.closest( '.wp-block-jetpack-podcast-player' );

	parentBlockEl.classList.remove( 'is-playing' );
	parentBlockEl.classList.add( 'is-paused' );
}

const episodeLinkEls = document.querySelectorAll( '[data-jetpack-podcast-audio]' );

Array.prototype.forEach.call( episodeLinkEls, buildEpisodeLinkClickHandler );

function buildEpisodeLinkClickHandler( episodeLinkEl ) {
	episodeLinkEl.addEventListener( 'click', handleEpisodeLinkClick );
}

function handleEpisodeLinkClick( e ) {
	// Prevent handling clicks if a modifier is in use.
	if ( e.shiftKey || e.metaKey || e.altKey ) {
		return;
	}

	const episodeLinkEl = e.currentTarget;

	// Get clicked episode audio URL
	const audioUrl = episodeLinkEl.getAttribute( 'data-jetpack-podcast-audio' );
	if ( ! audioUrl ) {
		// ToDo: render error message from template
		return;
	}

	// Get clicked episode element
	const episodeEl = episodeLinkEl.closest( '.podcast-player__episode' );
	if ( ! episodeLinkEls ) {
		// ToDo: render error message from template
		return;
	}

	// Get episode's parent block element
	const blockEl = episodeEl.closest( '.wp-block-jetpack-podcast-player' );
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

	const activeEpisodeEl = blockEl.querySelector( '.is-active' );

	if ( activeEpisodeEl ) {
		activeEpisodeEl.classList.remove( 'is-active' );
	}

	player.audio.src = audioUrl;
	player.audio.play();
	episodeEl.classList.add( 'is-active' );

	e.preventDefault();
}
