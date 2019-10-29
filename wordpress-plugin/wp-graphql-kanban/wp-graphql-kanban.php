<?php
/**
 * Plugin Name: WPGraphQL Kanban
 * Plugin URI: https://www.wpgraphql.com
 * Description: Plugin created to demonstrate WordPress as the application platform for a GatsbyJS based Kanban board using react-trello
 * Author: Jason Bahl
 * License: GPL-3.0+
 */

/**
 * Register Post Type and Taxonomy
 */
add_action( 'init', function() {
	register_post_type( 'task', [
		'label' => __( 'Tasks', 'wp-graphql-kanban' ),
		'show_ui' => true,
		'show_in_graphql' => true,
		'graphql_single_name' => 'Task',
		'graphql_plural_name' => 'Tasks',
		'taxonomies' => [ 'task-lane', 'post_tag' ],
		'supports' => [ 'title', 'excerpt', 'editor' ]
	] );
	register_taxonomy( 'task-lane', [ 'task' ], [
		'label' => __( 'Task Lanes', 'wp-graphql-kanban' ),
		'show_ui' => true,
		'show_admin_column' => true,
		'show_in_graphql' => true,
		'graphql_single_name' => 'TaskLane',
		'graphql_plural_name' => 'TaskLanes'
	] );
} );

add_action( 'graphql_register_types', function( $type_registry ) {

	register_graphql_field( 'RootQuery', 'lanes', [
		'type' => [
			'list_of' => 'TaskLane',
		],
		'description' => __( 'All Task Lanes', 'wp-graphql-kanban' ),
		'resolve' => function() {
			$terms = get_terms([
				'taxonomy' => 'task-lane',
				'hide_empty' => false,
			]);

			return $terms ? array_map( function( $term ) { return new \WPGraphQL\Model\Term( $term ); }, $terms ) : [];
		}
	] );

	register_graphql_fields( 'TaskLane', [
		'cards' => [
			'type' => [
				'list_of' => 'Task',
			],
			'description' => __( 'All tasks in the task lane', 'wp-graphql-kanban' ),
			'resolve' => function( $lane ) {

				$cards = new WP_Query([
					'post_type' => 'task',
					'post_status' => 'publish',
					'posts_per_page' => 1000,
					'task-lane' => $lane->slug,
					'fields' => 'id'
				]);

				return $cards->posts ? array_map( function( $task ) { return new \WPGraphQL\Model\Post( $task ); }, $cards->posts ) : [];
			}
		],
		'label' => [
			'type' => 'String',
			'description' => __( 'Label of the task (the post excerpt)', 'wp-graphql-kanban' ),
			'resolve' => function( $lane ) {
				return $lane->description ? $lane->description : null;
			}
		],

	]);

	register_graphql_fields( 'Task', [
		'description' => [
			'type' => 'String',
			'description' => __( 'Short description of the task (the post content)', 'wp-graphql-kanban' ),
			'resolve' => function( $post ) {
				return $post->post_content ? apply_filters( 'the_content', $post->post_content ) : null;
			}
		],
		'label' => [
			'type' => 'String',
			'description' => __( 'Label of the task (the post excerpt)', 'wp-graphql-kanban' ),
			'resolve' => function( $post ) {
				return $post->post_excerpt ? apply_filters( 'the_content', $post->post_excerpt ) : null;
			}
		],
	] );

	register_graphql_fields( 'Tag', [
		'color' => [
			'type' => 'String',
			'description' => __( 'The color of the tag', 'wp-graphql-kanban' ),
			'resolve' => function( $tag ) {
				$color = get_term_meta( $tag->term_id, 'color', true );
				return $color ? $color : '#222222';
			}
		],
		'bgColor' => [
			'type' => 'String',
			'description' => __( 'Background Color of the tag', 'wp-graphql-kanban' ),
			'resolve' => function( $tag ) {
				$bgcolor = get_term_meta( $tag->term_id, 'bg_color', true );
				return $bgcolor ? $bgcolor : '#222222';
			}
		]
	]);

} );
