import React from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';

import Aux from "../../hoc/_Aux";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import AuthenticationService from "../../service/Authenticatonservice";
import NotificationSystem from "react-notification-system";
import APIService from "../../service/Apiservice";

const products = [{
    id: 1,
    name: "Product1",
    price: 120
}, {
    id: 2,
    name: "Product2",
    price: 80
}];
class BootstrapTables extends React.Component {
    notificationSystem = React.createRef();
    constructor() {
        super();
        this.state = {
            sysusers: [],
            open: false,
            openUpdate: false,
            username: '',
            phonenumber: '',
            fullnames: '',
            updated_fullnames: '',
            updated_phonenumber: '',
            updated_user_id: '',
            _notificationSystem: null,
            role: '',
            updated_role: '',
        }
    }
    async componentDidMount() {
        this.checkLogin();
        await this.getSystemusers();
    }
    checkLogin() {
        if (JSON.stringify(AuthenticationService.getUser()) == '{}') {
            const { from } = this.props.location.state || {
                from: { pathname: "/" }
            };
            this.props.history.push("/");
        }
    }
    async getSystemusers() {
        //call API

        await APIService.makeApiGetRequest("users")
            .then(data => this.setState({ sysusers: data }));

    }
    getDepartment(cell, row) {
        return cell.dept_name;
    }
    getRole(cell, row) {
        return cell.role_name;
    }
    cellButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
                size="sm"
                variant="primary"
            /*onClick={() =>
                this.onClickUserSelected(cell, row, enumObject, rowIndex)
            }*/
            >
                Update
            </Button>

        );
    }
    deleteButton(cell, row, enumObject, rowIndex) {
        const { classes } = this.props;
        return (

            <Button
                size="sm"
                variant="danger"
            /*onClick={() =>
                this.onClickUserSelected(cell, row, enumObject, rowIndex)
            }*/
            >
                Delete
            </Button>

        );
    }
    render() {
        return (
            <Aux>
                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <Card.Title as="h5">Users</Card.Title>
                                <Button
                                    size="sm"
                                    variant="success"
                                /*onClick={() =>
                                    this.onClickUserSelected(cell, row, enumObject, rowIndex)
                                }*/
                                >Add user</Button>
                            </Card.Header>
                            <Card.Body>
                                <BootstrapTable data={this.state.sysusers} striped hover>
                                    <TableHeaderColumn isKey dataField='id' hidden>ID</TableHeaderColumn>
                                    <TableHeaderColumn dataField='full_name'>Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='department' dataFormat={this.getDepartment}>Department</TableHeaderColumn>
                                    <TableHeaderColumn dataField="roles" dataFormat={this.getRole}>Role</TableHeaderColumn>
                                    <TableHeaderColumn
                                        width="15%"
                                        height="2%"
                                        thStyle={{ verticalAlign: "top" }}
                                        dataField="button"
                                        dataFormat={this.cellButton.bind(this)}
                                    >
                                        Actions
                                    </TableHeaderColumn>
                                    <TableHeaderColumn
                                        width="15%"
                                        height="2%"
                                        thStyle={{ verticalAlign: "top" }}
                                        dataField="button"
                                        dataFormat={this.deleteButton.bind(this)}
                                    >
                                        Actions
                                    </TableHeaderColumn>
                                </BootstrapTable>
                            </Card.Body>
                        </Card>


                    </Col>
                </Row>
            </Aux>
        );
    }
}

export default BootstrapTables;