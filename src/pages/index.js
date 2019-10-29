import React from "react"
import Board from "react-trello"
import gql from 'graphql-tag'
import {Query} from 'react-apollo'
import {client} from '../apollo/client'
import Login from '../components/Login'
import { Layout, Menu } from 'antd';

const { Header, Content } = Layout;

/**
 * Query all lanes and tasks
 */
const GET_TASK_LANES_AND_TASKS = gql`
 {
    lanes {
        id
        title: name
        cards {
            id
            title
            description
            label
        }
    }
}
`;

class KanbanBoard extends React.Component {

    state = {
        loggedIn: false,
        boardData: {
            lanes: [
                {
                    id: 'loading',
                    title: 'loading..',
                    cards: []
                }
            ]
        }
    };

    componentDidMount() {
        const authToken = localStorage.getItem( 'authToken' );

        if ( authToken ) {
            this.setState({ loggedIn: authToken })
        }
    }

    handleLogin = input => {

        client.mutate({
            mutation: gql`
                mutation LOGIN( $input: LoginInput! ) {
                  login( input: $input ) {
                    authToken
                    refreshToken
                    user {
                      id
                      username
                    }
                  }
                }
            `,
            variables: {
                input: {
                    clientMutationId: 'Login',
                    username: input.username,
                    password: input.password,
                },
            },
        }).then( res => {

            this.setState({
                loggedIn: {
                    authToken: res.data.login.authToken,
                    refreshToken: res.data.login.refreshToken,
                }
            });

            localStorage.setItem( 'authToken', res.data.login.authToken );
            localStorage.setItem( 'refreshToken', res.data.login.refreshToken );

        });
    };

    handleCardAdd = ( card, laneId ) => {
        console.log('handleCardAdd', {
            card,
            laneId
        });

        let id = laneId ? atob(laneId) : null;
        id = id ? id.split(':') : null;

        const variables = {
            input: {
                clientMutationId: 'CreateCard',
                status: 'PUBLISH',
                title: card && card.title ? card.title : null,
                excerpt: card && card.label ? card.label : null,
                content: card && card.description ? card.description : null,
                taskLanes: laneId && id && id[1] ? {
                    "append": false,
                    "nodes": [
                        {
                            "id": parseInt( id[1] )
                        }
                    ]
                } : null,
            }
        };

        const CREATE_CARD = gql`
        mutation CreateTask( $input:CreateTaskInput! ) {
            createTask( input: $input ) {
              card: task {
                id
              }
            }
        }`;

        client.mutate({
            mutation: CREATE_CARD,
            variables,
            refetchQueries:[{query: GET_TASK_LANES_AND_TASKS}]
        })

    };

    handleCardDelete = (cardId, laneId) => {

        const DELETE_TASK = gql`
        mutation DeleteTask($input: DeleteTaskInput!) {
          deleteTask(input: $input) {
            card: task {
              id
            }
          }
        }
        `;

        const variables = {
            input: {
                clientMutationId: 'DeleteTask',
                id: cardId
            }
        };

        client.mutate({
            mutation: DELETE_TASK,
            variables,
        })

    };

    handleCardMoveAcrossLanes = (fromLaneId, toLaneId, cardId, index) => {
        console.log('handleCardMoveAcrossLanes', {
            fromLaneId,
            toLaneId,
            cardId,
            index
        });

        let id = toLaneId ? atob(toLaneId) : null;
        id = id ? id.split(':') : null;

        const variables = {
            input: {
                clientMutationId: 'CreateCard',
                id: cardId ? cardId : null,
                taskLanes: toLaneId && id && id[1] ? {
                    "append": false,
                    "nodes": [
                        {
                            "id": parseInt( id[1] )
                        }
                    ]
                } : null,
            }
        };

        const UPDATE_TASK_LANE = gql`
        mutation UpdateTaskLane( $input: UpdateTaskInput! ){
            updateTask( input: $input ) {
               task {
                 id
               }
            }
        }
        `;

        client.mutate({
            mutation: UPDATE_TASK_LANE,
            variables
        });

    };

    handleLaneAdd = (params) => {

        const {title} = params;

        const CREATE_LANE = gql`
        mutation CreateTaskLane($input:CreateTaskLaneInput!){
          createTaskLane(input: $input) {
             taskLane {
               id
               title: name
             }
          }
        }
        `;

        client.mutate({
            mutation: CREATE_LANE,
            variables: {
                input: {
                    clientMutationId: "Create Task Lane",
                    name: title,
                }
            },
            refetchQueries: [{ query: GET_TASK_LANES_AND_TASKS }]
        });
    };

    handleLaneDelete = (laneId) => {

        const DELETE_LANE = gql`
        mutation DeleteLane( $input: DeleteTaskLaneInput! ) {
            deleteTaskLane( input:$input ) {
               deletedId
            }
        }`;

        client.mutate({
            mutation: DELETE_LANE,
            variables: {
                input: {
                    clientMutationId: "DeleteLane",
                    id: laneId,
                },
            }
        });

    };

    handleLaneUpdate = (laneId, data) => {
        console.log('handleLaneUpdate', {
            laneId,
            data
        })

        const UPDATE_LANE = gql`
        mutation updateTaskLane( $input: UpdateTaskLaneInput! ) {
          updateTaskLane( input: $input ) {
            taskLane {
              id
            }
          }
        }
        `;

        if ( data && data.title ) {
            client.mutate({
                mutation: UPDATE_LANE,
                variables: {
                    input: {
                        clientMutationId: 'UpdateTaskLane',
                        id: laneId,
                        title: data.title
                    }
                }
            })
        }
    };

    render() {

        /**
         * If not logged in, show the login page
         */
        if (!this.state.loggedIn) {
            return <Login handleLogin={ this.handleLogin }/>;
        } else {
            return (
                <Query query={GET_TASK_LANES_AND_TASKS}>
                    {({loading, error, data}) => {

                        if (loading) return <Board data={this.state.boardData}/>;
                        if (error) return `Error! ${error.message}`;
                        return (
                        <Layout className="layout">
                            <Header
                                style={{
                                    background: 'white'
                                }}
                            >
                                <Menu
                                    theme="light"
                                    mode="horizontal"
                                    defaultSelectedKeys={['2']}
                                    style={{ lineHeight: '64px', float: 'right' }}
                                >
                                    <Menu.Item key="1" onClick={() => {
                                        localStorage.clear();
                                        this.setState({loggedIn:false});
                                    }}>
                                        Logout
                                    </Menu.Item>
                                </Menu>
                            </Header>
                            <Content >
                                <Board

                                    editable
                                    canAddLanes
                                    draggables
                                    editLaneTitle
                                    onCardClick={this.handleCardClick}
                                    onCardAdd={this.handleCardAdd}
                                    onCardDelete={this.handleCardDelete}
                                    onCardMoveAcrossLanes={this.handleCardMoveAcrossLanes}
                                    onLaneAdd={this.handleLaneAdd}
                                    onLaneDelete={this.handleLaneDelete}
                                    onLaneUpdate={this.handleLaneUpdate}
                                    data={data}
                                />
                            </Content>
                        </Layout>
                        );
                    }}
                </Query>
            );
        }
    }
}

export default KanbanBoard
