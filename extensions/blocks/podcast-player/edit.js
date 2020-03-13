/* eslint-disable no-unused-vars */

/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import {
	Button,
	Disabled,
	ExternalLink,
	PanelBody,
	Placeholder,
	RangeControl,
	TextControl,
	Toolbar,
	Notice,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BlockControls, BlockIcon, InspectorControls } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import { isURL } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './editor.scss';
import { edit, queueMusic } from './icons/';
import { isAtomicSite, isSimpleSite } from '../../shared/site-type-utils';

const DEFAULT_MIN_ITEMS = 1;
const DEFAULT_MAX_ITEMS = 10;

const handleSSRError = () => {
	return <p>{ __( 'Failed to load Block', 'jetpack' ) }</p>;
};

// Support page link.
const supportLink =
	isSimpleSite() || isAtomicSite()
		? 'http://en.support.wordpress.com/wordpress-editor/blocks/podcast-player-block/'
		: 'https://jetpack.com/support/jetpack-blocks/podcast-player-block/';

/**
 * Control component used either inside of the Podcast block
 * as well as into the InspectorControls section (sidebar)
 *
 * @param {string}      url             Podcast Feed URL
 * @param {string|Null} label           Input field label. Optional.
 * @param {Function}    onUrlChange     onChange text handler.
 * @param {Function}    onEnterKeyPress on Enter key input event handler. Optional.
 * @param {Function}    onBlur          onBlur input handler. Optional.
 * @return {*}                          React component
 */
const FeedURLControl = ( {
	url,
	label = null,
	onUrlChange,
	onEnterKeyPress = noop,
	onBlur = noop,
} ) => (
	<TextControl
		label={ label }
		type="url"
		placeholder={ __( 'Enter URL here…', 'jetpack' ) }
		value={ url || '' }
		className={ 'components-placeholder__input' }
		onChange={ onUrlChange }
		onKeyPress={ ev => ( ev.key === 'Enter' ? onEnterKeyPress( ev ) : noop ) }
		onBlur={ onBlur }
	/>
);

const PodcastPlayerEdit = ( { attributes, setAttributes } ) => {
	// Block attributes.
	const { url, itemsToShow, showCoverArt, showEpisodeDescription } = attributes;

	// State.
	const [ editedUrl, setEditedUrl ] = useState( url || '' );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ urlError, setUrlError ] = useState( '' );

	/**
	 * Check if the current URL of the Podcast RSS feed
	 * is valid. If so, set the block attribute and changes
	 * the edition mode.
	 * This function is bound to the onSubmit event for the form.
	 *
	 * @param {object} event Form on submit event object.
	 */
	const checkPodcastLink = event => {
		event.preventDefault();

		if ( ! editedUrl ) {
			return;
		}
		const isValidURL = isURL( editedUrl );

		setUrlError(
			! isValidURL
				? __( "Your podcast couldn't be embedded. Please double check your URL.", 'jetpack' )
				: ''
		);

		if ( isValidURL ) {
			setAttributes( { url: editedUrl } );
			setIsEditing( false );
		}
	};

	if ( isEditing || ! url ) {
		return (
			<Placeholder
				icon={ <BlockIcon icon={ queueMusic } /> }
				label={ __( 'Podcast Player', 'jetpack' ) }
				instructions={ __( 'Enter your podcast RSS feed URL.', 'jetpack' ) }
			>
				<form onSubmit={ checkPodcastLink }>
					{ urlError && <Notice>{ urlError }</Notice> }
					<FeedURLControl url={ editedUrl || '' } onUrlChange={ setEditedUrl } />
					<Button isPrimary type="submit">
						{ __( 'Embed', 'jetpack' ) }
					</Button>
				</form>
				<div className="components-placeholder__learn-more">
					<ExternalLink href={ supportLink }>
						{ __( 'Learn more about embeds', 'jetpack' ) }
					</ExternalLink>
				</div>
			</Placeholder>
		);
	}

	const toolbarControls = [
		{
			icon: edit,
			title: __( 'Edit Podcast Feed URL', 'jetpack' ),
			onClick: () => setIsEditing( true ),
		},
	];

	return (
		<>
			<BlockControls>
				<Toolbar controls={ toolbarControls } />
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Podcast settings', 'jetpack' ) }>
					<FeedURLControl
						label={ __( 'RSS Feed URL', 'jetpack' ) }
						url={ editedUrl || '' }
						onUrlChange={ setEditedUrl }
						onEnterKeyPress={ checkPodcastLink }
						onBlur={ checkPodcastLink }
					/>

					<RangeControl
						label={ __( 'Number of items', 'jetpack' ) }
						value={ itemsToShow }
						onChange={ value => setAttributes( { itemsToShow: value } ) }
						min={ DEFAULT_MIN_ITEMS }
						max={ DEFAULT_MAX_ITEMS }
						required
					/>

					<ToggleControl
						label={ __( 'Show Cover Art', 'jetpack' ) }
						checked={ showCoverArt }
						onChange={ value => setAttributes( { showCoverArt: value } ) }
					/>

					<ToggleControl
						label={ __( 'Show Episode Description', 'jetpack' ) }
						checked={ showEpisodeDescription }
						onChange={ value => setAttributes( { showEpisodeDescription: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<Disabled>
				<ServerSideRender
					block="jetpack/podcast-player"
					attributes={ attributes }
					EmptyResponsePlaceholder={ handleSSRError }
					ErrorResponsePlaceholder={ handleSSRError }
				/>
			</Disabled>
		</>
	);
};

export default PodcastPlayerEdit;
