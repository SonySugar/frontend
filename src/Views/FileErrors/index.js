import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Card from "../../App/components/MainCard";
import Aux from "../../hoc/_Aux";
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";

import CircularProgress from "../../App/components/CircularProgress";
import styled from "styled-components";

import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

var custom_notification_style = {
    NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
            margin: '10px 5px 2px 1px'
        },

        warning: {
            color: 'white',
            backgroundColor: "orange",
            textStyle: "bold"
        },
        error: {
            color: 'white',
            backgroundColor: "red",
            textStyle: "bold"
        },
        success: {
            color: 'white',
            backgroundColor: "green",
            textStyle: "bold"
        }
    }
}
const SpinnerDiv = styled.div`
text-align: center;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: RGBA(0, 0, 0, 0.2);
display: grid;
place-items: center;
z-index: 10;
`;
class FileErrors extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            error_list: [],
            error_list_temp: [],
            _notificationSystem: null,
            show_progress_status: false
        }
    }
    async componentDidMount() {
        this.setState({ show_progress_status: true });
        this.checkLogin();
        await this.getErrors();
        this.setState({ show_progress_status: false });
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            this.logout();
        }
    }
    handleChange = (event, stateName) => {
        this.setState({
            [stateName]: event.target.value
        });
    };
    logout() {

        const { from } = this.props.location.state || {
            from: { pathname: "/" }
        };
        this.props.history.push("/");

    }
    async getErrors() {
        //call API
        const notification = this.notificationSystem.current;
        let apiResponse = await APIService.makeApiGetRequest("uploaded_files_errors");
        if (apiResponse.status == 403) {
            this.setState({ closesession: true });
            notification.addNotification({
                message: apiResponse.message,
                level: 'error',
                autoDismiss: 5
            });
        } else {

            this.setState({ error_list: apiResponse, error_list_temp: apiResponse });


        }

    }
    handleErrorSearch(e) {
        let value = e.target.value;

        //lets do a filter
        let searchResult = this.state.error_list.filter(s => {
            return s.uploaded_by.includes(value.toLowerCase()) || s.file_name.includes(value) || s.corporate_name.includes(value);
        });
        this.setState({
            error_list_temp: searchResult
        });

    }



    render() {
        return (
            <Aux>
                {this.state.show_progress_status && (<SpinnerDiv>
                    <CircularProgress />
                </SpinnerDiv>)}
                <NotificationSystem ref={this.notificationSystem} style={custom_notification_style} />
                <Row>
                    <Col>
                        <Card title='File Upload Exceptions' isOption>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" style={{ color: '#000000' }} placeholder="You can search by File Name or Email or Corporate" onChange={e => this.handleErrorSearch(e)} />
                            </div>
                            <br />

                            <Table>
                                <Thead>
                                    <Tr style={{ border: '1px solid' }}>
                                        <Th>Name</Th>
                                        <Th>Uploaded by</Th>
                                        <Th>Date Uploaded</Th>
                                        <Th>Corporate</Th>
                                        <Th>Error</Th>


                                    </Tr>

                                </Thead>
                                {this.state.error_list_temp==null||this.state.error_list_temp.length == 0 ? <Tbody>
                                    <Tr style={{ border: '1px solid' }} key={0}>
                                        <Td>No data available......</Td>
                                    </Tr>
                                </Tbody> : <Tbody>
                                    {this.state.error_list_temp.map(
                                        (u, index) => (
                                            <Tr style={{ border: '1px solid' }} key={index}>
                                                <Td>
                                                    {u.file_name}
                                                </Td>
                                                <Td>
                                                    {u.uploaded_by}
                                                </Td>
                                                <Td>
                                                    {u.date_uploaded}
                                                </Td>

                                                <Td>{u.corporate_name}</Td>
                                                <Td>{u.error_message}</Td>

                                            </Tr>
                                        )
                                    )}
                                </Tbody>}
                            </Table>


                        </Card>


                    </Col>
                </Row>

            </Aux>

        );
    }
}

export default FileErrors;