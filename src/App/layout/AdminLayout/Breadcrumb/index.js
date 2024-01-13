import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import config from '../../../../config';
import navigation from '../../../../menu-items';
import DEMO from "../../../../store/constant";
import Aux from "../../../../hoc/_Aux";
import Authenticatonservice from '../../../../service/Authenticatonservice';

class Breadcrumb extends Component {
    state = {
        main: [],
        item: []
    };

    componentDidMount() {
        //Get user logged in
        try{
       
       
        (navigation.items).map((item, index) => {
            if (item.type && item.type === 'group') {
                this.getCollapse(item, index);
            }
            return false;
        });
    }catch(e){}
    };

    componentWillReceiveProps = () => {
        (navigation.items).map((item, index) => {
            if (item.type && item.type === 'group') {
                this.getCollapse(item);
            }
            return false;
        });
    };

    getCollapse = (item) => {
        if (item.children) {
            (item.children).filter( collapse => {
                if (collapse.type && collapse.type === 'collapse') {
                    this.getCollapse(collapse,);
                } else if (collapse.type && collapse.type === 'item') {
                    if (document.location.pathname === config.basename+collapse.url) {
                        this.setState({item: collapse, main: item});
                    }
                }
                return false;
            });
        }
    };

    render() {
        let main, item;
        let breadcrumb = '';
        let title = 'Welcome';
        if (this.state.main && this.state.main.type === 'collapse') {
            main = (
                <li className="breadcrumb-item">
                    <a href={DEMO.BLANK_LINK}>{this.state.main.title}</a>
                </li>
            );
        }

        if (this.state.item && this.state.item.type === 'item') {
            title = this.state.item.title;
            item = (
                <li className="breadcrumb-item">
                   
                </li>
            );

            if(this.state.item.breadcrumbs !== false) {
                breadcrumb = (
                    <div className="page-header">
                        <div className="page-block">
                            <div className="row align-items-center">
                                <div className="col-md-12">
                                   
                                    <ul className="breadcrumb">
                                      
                                        {main}
                                        {item}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

        }

        document.title = title + ' | SonySugar';

        return (
            <Aux>
                {breadcrumb}
            </Aux>
        );
    }
}

export default Breadcrumb;