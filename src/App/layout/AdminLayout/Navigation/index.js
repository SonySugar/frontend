import React, { Component } from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import windowSize from 'react-window-size';

import NavLogo from './NavLogo';
import NavContent from './NavContent';
import OutsideClick from './OutsideClick';
import Aux from './../../../../hoc/_Aux'
import * as actionTypes from './../../../../store/actions';
import navigation from '../../../../menu-items';
import Authenticatonservice from '../../../../service/Authenticatonservice';
import CustomerAuthenticationservice from '../../../../service/CustomerAuthenticationservice';
import apinavigation from '../../../../apiconfig-items';

class Navigation extends Component {
    constructor() {
        super();
        this.state = {
            privileges: [],
            new_items: {},
            showNavContent: false
        }
    }

    resize = () => {
        const contentWidth = document.getElementById('root').clientWidth;

        if (this.props.layout === 'horizontal' && contentWidth < 992) {
            this.props.onChangeLayout('vertical');
        }
    };

    componentDidMount() {
        this.state.privileges = [];
      
        this.resize();
        window.addEventListener('resize', this.resize)
        this.setState({
            showNavContent: true
        });
        
        let privilegeList = [];
        let privileges = Authenticatonservice.getUser().data.systemUser.roles.privileges;
        for(let k in privileges){
           
            privilegeList.push(privileges[k].mprivileges.privilege_name);
        }
       
        this.state.new_items = navigation;
       

        if(!privilegeList.includes("view_system_settings")){
            this.removeById(navigation.items,"api-settings");
        }

        if(!privilegeList.includes("view_users")){
            this.removeById(navigation.items,"user-settings");
        }

        if(!privilegeList.includes("view_department")){
            this.removeById(navigation.items,"departments-settings");
        }

        if(!privilegeList.includes("view_sms")){
            this.removeById(navigation.items,"smstemplate-settings");
        }

        if(!privilegeList.includes("view_ticket")){
            this.removeById(navigation.items,"tickets-settings");
        }

        if(!privilegeList.includes("view_lar")){
            this.removeById(navigation.items,"lar-settings");
        }

        if(!privilegeList.includes("view_tcr")){
            this.removeById(navigation.items,"tcr-settings");
        }
        if(!privilegeList.includes("view_order")){
            this.removeById(navigation.items,"order-settings");
        }

        // if(!privilegeList.includes("view_audits")){
        //     this.removeById(navigation.items,"audit-settings");
        // }
       

      
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }
    removeById = (arr, id) => {
        const requiredIndex = arr.findIndex(el => {
           return el.id === String(id);
        });
        if(requiredIndex === -1){
           return false;
        };
        return !!arr.splice(requiredIndex, 1);
     };

    

    render() {
        let navClass = [
            'pcoded-navbar',
        ];

        if (this.props.preLayout !== null && this.props.preLayout !== '' && this.props.preLayout !== 'layout-6' && this.props.preLayout !== 'layout-8') {
            navClass = [...navClass, this.props.preLayout];
        } else {
            navClass = [
                ...navClass,
                this.props.layoutType,
                this.props.navBackColor,
                this.props.navBrandColor,
                'drp-icon-'+this.props.navDropdownIcon,
                'menu-item-icon-'+this.props.navListIcon,
                this.props.navActiveListColor,
                this.props.navListTitleColor,
            ];

            if (this.props.layout === 'horizontal') {
                navClass = [...navClass, 'theme-horizontal'];
            }

            if (this.props.navBackImage) {
                navClass = [...navClass, this.props.navBackImage];
            }

            if (this.props.navIconColor) {
                navClass = [...navClass, 'icon-colored'];
            }

            if (!this.props.navFixedLayout) {
                navClass = [...navClass, 'menupos-static'];
            }

            if (this.props.navListTitleHide) {
                navClass = [...navClass, 'caption-hide'];
            }
        }

        if (this.props.windowWidth < 992 && this.props.collapseMenu) {
            navClass = [...navClass, 'mob-open'];
        } else if (this.props.collapseMenu) {
            navClass = [...navClass, 'navbar-collapsed'];
        }

        if (this.props.preLayout === 'layout-6') {
            document.body.classList.add('layout-6');
            document.body.style.backgroundImage = this.props.layout6Background;
            document.body.style.backgroundSize = this.props.layout6BackSize;
        }

        if (this.props.preLayout === 'layout-8') {
            document.body.classList.add('layout-8');
        }

        if (this.props.layoutType === 'dark') {
            document.body.classList.add('datta-dark');
        } else {
            document.body.classList.remove('datta-dark');
        }

        if (this.props.rtlLayout) {
            document.body.classList.add('datta-rtl');
        } else {
            document.body.classList.remove('datta-rtl');
        }

        if (this.props.boxLayout) {
            document.body.classList.add('container');
            document.body.classList.add('box-layout');
        } else {
            document.body.classList.remove('container');
            document.body.classList.remove('box-layout');
        }

        let navContent = (
           
            <div className="navbar-wrapper">
                <NavLogo collapseMenu={this.props.collapseMenu} windowWidth={this.props.windowWidth} onToggleNavigation={this.props.onToggleNavigation} />
                <NavContent navigation={navigation.items} />
            </div>
        );

   

    
        return (
            <Aux>
                <nav className={navClass.join(' ')}>
                    
                    {this.state.showNavContent ? navContent: null}
                </nav>
            </Aux>
        );  
    

       
    }
}

const mapStateToProps = state => {
    return {
        layout: state.layout,
        preLayout: state.preLayout,
        collapseMenu: state.collapseMenu,
        layoutType: state.layoutType,
        navBackColor: state.navBackColor,
        navBackImage: state.navBackImage,
        navIconColor: state.navIconColor,
        navBrandColor: state.navBrandColor,
        layout6Background: state.layout6Background,
        layout6BackSize: state.layout6BackSize,
        rtlLayout: state.rtlLayout,
        navFixedLayout: state.navFixedLayout,
        boxLayout: state.boxLayout,
        navDropdownIcon: state.navDropdownIcon,
        navListIcon: state.navListIcon,
        navActiveListColor: state.navActiveListColor,
        navListTitleColor: state.navListTitleColor,
        navListTitleHide: state.navListTitleHide
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onToggleNavigation: () => dispatch({type: actionTypes.COLLAPSE_MENU}),
        onChangeLayout: (layout) => dispatch({type: actionTypes.CHANGE_LAYOUT, layout: layout}),
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(windowSize(Navigation)));
