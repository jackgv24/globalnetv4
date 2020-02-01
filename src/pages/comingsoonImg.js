import React, { Fragment } from 'react';
import logo from '../assets/images/other-images/coming-soon-Logo.png'
import CountdownComponent from '../components/common/countdownComponent';

const ComingSoonImg = () => {
    return (
        <Fragment>
            <div className="page-wrapper">
                <div className="container-fluid p-0 m-0">
                    <div className="comingsoon comingsoon-bgimg">
                        <div className="comingsoon-inner text-center"><img src={logo} alt="" />
                            <h5>WE ARE COMING SOON</h5>
                            <div id="clockdiv">
                              <CountdownComponent />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ComingSoonImg;