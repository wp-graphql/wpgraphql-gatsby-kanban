# WPGraphQL + Gatsby Kanban Board

This is a Kanban board created with WPGraphQL and Gatsby, making use of react-trello.

This demonstrates how Gatsby is more than a static site generator, and WordPress can be used to power full applications, beyond simple blogs and marketing sites. 

![GIF animation showing a Kanban board with CRUD functionality.](./img/wpkanban-demo.gif)

## Setup

This is a Gatsby App that needs to communicate with a WordPress server using GraphQL. 

### WordPress Environment

A WordPress install must have the following plugins installed and activated: 

- WPGraphQL: https://github.com/wp-graphql/wp-graphql
- WPGraphQL JWT Authentication https://github.com/wp-graphql/wp-graphql-jwt-authentication
- WPGraphQL Kanban (found in the `wordpress-plugin` directory of this repository)

### Gatsby App

- Clone this repo
- From within the cloned directory, do the following:
  - Copy `.env.sample` to `.env.development` and replace the value of the `WPGRAPHQL_URI` with the path to your WordPress install (including the trailing `/graphql`) running the above mentioned plugins.
  - run `gatsby develop`
